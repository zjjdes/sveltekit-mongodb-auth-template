import { SvelteKitAuth, CredentialsSignin } from '@auth/sveltekit'
import Credentials from '@auth/sveltekit/providers/credentials'
import Google from '@auth/sveltekit/providers/google'
import Nodemailer from '@auth/sveltekit/providers/nodemailer'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'
import { UserService } from '$lib/server/UserService'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'
import { UserCredentialsService } from './UserCredentialsService'
import { smtpOptions, sendVerificationEmail } from '$lib/server/email'
import {
    AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET,
    AUTH_SECRET,
    AUTH_MAXAGE,
    MONGODB_URI,
    EMAIL_FROM,
} from '$env/static/private'

// Augment types in Auth.js
declare module '@auth/sveltekit' {
    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User extends App.User {}
    /**
     * The shape of the account object returned in the OAuth providers' `account` callback,
     * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
     */
    // interface Account {}

    /**
     * Returned by `useSession`, `auth`, contains information about the active session.
     */
    interface Session {
        /**
         * By default, TypeScript merges new interface properties and overwrites existing ones.
         * In this case, the default session user properties will be overwritten,
         * with the new ones defined above. To keep the default session user properties,
         * you need to add them back into the newly declared interface.
         */
        user: App.User // & DefaultSession['user']
        expires: string
    }
}

// DB client
let client: MongoClient
if (import.meta.env.DEV) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient
    }

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(MONGODB_URI)
    }
    client = globalWithMongo._mongoClient
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(MONGODB_URI)
}

export const { handle, signIn, signOut } = SvelteKitAuth({
    adapter: MongoDBAdapter(client, {
        collections: {
            Users: 'user',
            Accounts: 'userIdentity',
        },
    }),
    secret: AUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: Number(AUTH_MAXAGE),
    },
    trustHost: true,
    pages: {
        signIn: '/profile',
        signOut: '/profile',
    },
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async credentials => {
                /**
                 * Sign in logic is implemented here
                 * However, registration is not supported by Auth.js and must be implemented separately
                 */

                // Verify if user exists
                const userService = new UserService()
                const user = await userService.findByEmail(String(credentials.email))

                if (!user) {
                    class UserNotFoundError extends CredentialsSignin {
                        code = 'User not found'
                    }
                    throw new UserNotFoundError()
                }

                // Check if user's email is verified
                // if not, send verification email again
                if (!user.emailVerified) {
                    const verificationTokenService = new VerificationTokenService()
                    const verificationToken = (
                        await verificationTokenService.createOrUpdateToken(user.id)
                    ).token
                    await sendVerificationEmail(user.email, user.id, verificationToken)

                    class EmailNotVerifiedError extends CredentialsSignin {
                        code = 'Email has not been verified'
                    }
                    throw new EmailNotVerifiedError()
                }

                // Verify password
                class InvalidCredentialsError extends CredentialsSignin {
                    code = 'Invalid user credentials'
                }
                const userCredentialsService = new UserCredentialsService()
                const userCredentials = await userCredentialsService.findByUserId(user.id)
                if (!userCredentials) {
                    throw new InvalidCredentialsError()
                }

                const hashedPassword = userCredentials.password
                const passwordMatched = await comparePasswords(
                    String(credentials.password),
                    hashedPassword
                )

                if (!passwordMatched) {
                    throw new InvalidCredentialsError()
                }

                // Return user data
                return user
            },
        }),
        Google({
            clientId: AUTH_GOOGLE_ID,
            clientSecret: AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Nodemailer({
            server: smtpOptions,
            from: EMAIL_FROM,
        }),
    ],
    callbacks: {
        // Callbacks: jwt, redirect, session, signIn
        // https://authjs.dev/reference/sveltekit/types#callbacks
        async signIn({ profile, user }) {
            /**
             * When signing in with OAuth providers, update the user if needed
             */
            if (profile) {
                const userService = new UserService()
                const userInDb = await userService.findByEmail(String(user.email))

                if (userInDb) {
                    if (!userInDb.image && profile.picture) {
                        userInDb.image = String(profile.picture)
                    }

                    await userInDb.save()
                }
            }

            return true
        },
        async session({ session }) {
            const userService = new UserService()
            const user = await userService.findByEmail(session.user.email)

            // TODO: interface Session doesn't seem to be applied here

            // Obtain user data from the database
            if (user) {
                session.user = user.toObject()
            }

            return session
        },
    },
})

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
}
