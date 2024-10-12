import type { PageServerLoad } from './$types'
import { fail, error, redirect, type Actions } from '@sveltejs/kit'
import { formData2Object } from '$lib/utils'
import { sendVerificationEmail, sendResetPasswordEmail } from '$lib/server/email'
import { hashPassword, comparePasswords, createAccessToken } from '$lib/server/auth'
import { UserService } from '$lib/server/UserService'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'
import { UserCredentialsService } from '$lib/server/UserCredentialsService'
import { AUTH_MAXAGE } from '$env/static/private'

export const load = (async () => {
    return {}
}) satisfies PageServerLoad

export const actions = {
    signin: async ({ request, cookies }) => {
        // Get data from form
        const data = formData2Object(await request.formData())
        const email: string = data.email
        const password: string = data.password
        if (!email || !password) {
            fail(400, { message: 'Invalid credentials' })
        }

        // Verify if user exists
        const userService = new UserService()
        const user = await userService.findByEmail(email)
        if (!user) {
            error(404, { message: 'User not found' })
        }

        // Check if user has credentials
        const userCredentialsService = new UserCredentialsService()
        const userCredentials = await userCredentialsService.findByUserId(user.id)
        if (!userCredentials) {
            error(403, { message: 'Invalid user credentials, did you sign in through Google?' })
        }

        // Check if user's email is verified
        // if not, send verification email again
        if (!user.emailVerified) {
            const verificationTokenService = new VerificationTokenService()
            await verificationTokenService.deleteByUserId(user.id) // delete existing tokens
            const verificationToken = (await verificationTokenService.createOrUpdate(user.id)).token
            await sendVerificationEmail(user.email, user.id, verificationToken)

            error(401, { message: 'Email has not been verified, sent again' })
        }

        // Verify password
        const hashedPassword = userCredentials.password
        const passwordMatched = await comparePasswords(password, hashedPassword)

        if (!passwordMatched) {
            error(403, { message: 'Invalid user credentials' })
        }

        // Login successful, create accessToken and set cookie
        const accessToken = createAccessToken(user.id)
        cookies.set('accessToken', accessToken, { path: '/', maxAge: Number(AUTH_MAXAGE) })

        redirect(302, '/')
    },
    signout: async ({ cookies, locals }) => {
        cookies.delete('accessToken', { path: '/' })
        locals.currentUser = null
        redirect(302, '/')
    },
    register: async ({ request }) => {
        const data = await request.formData()

        // Get data from form
        const newUserData = formData2Object(data) as App.RegisterSchema

        // Validate data
        // TODO: move to component?
        if (!newUserData.password || newUserData.password.length < 8) {
            return fail(400, { message: 'Password must be at least 8 characters' })
        }

        if (!newUserData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserData.email)) {
            return fail(400, { message: 'Invalid email address' })
        }

        // Check if user exists
        const userService = new UserService()
        let newUser = await userService.findByEmail(newUserData.email)

        // Create user if not found
        if (!newUser) {
            newUser = await userService.create(newUserData)
        }

        const userCredentialsService = new UserCredentialsService()
        const userCredentials = await userCredentialsService.findByUserId(newUser.id)

        // Check if user exists: email is verified or credentials exist
        if (newUser.emailVerified || userCredentials) {
            error(400, 'User already exists')
        }

        // Create credentials for new user
        await userCredentialsService.create({
            userId: newUser.id,
            password: await hashPassword(String(newUserData.password)),
        })

        // Create and save verification token
        const verificationTokenService = new VerificationTokenService()
        const verificationToken = (await verificationTokenService.createOrUpdate(newUser.id)).token

        // Send verification email
        if (await sendVerificationEmail(newUser.email, newUser.id, verificationToken)) {
            return { ok: true, message: 'Registration successful, verification email sent' }
        } else {
            error(400, 'Failed to send verification email')
        }
    },
    resetPassword: async ({ request }) => {
        const data = await request.formData()
        const email = data.get('email')?.toString()

        // Data validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return fail(400, { message: 'Invalid email address' })
        }

        // Check that user exists
        const userService = new UserService()
        const user = await userService.findByEmail(email)
        if (!user) {
            error(404, 'User not found')
        }

        // Check that userCredentials exists
        const userCredentialsService = new UserCredentialsService()
        const userCredentials = await userCredentialsService.findByUserId(user.id)
        if (!userCredentials) {
            error(404, 'User credentials not found')
        }

        // Create verification token
        const verificationTokenService = new VerificationTokenService()
        const token = (await verificationTokenService.createOrUpdate(user.id)).token

        // Send email
        if (await sendResetPasswordEmail(user.email, user.id, token)) {
            return { ok: true, message: 'Password reset email sent' }
        } else {
            error(500, 'Failed to send password reset email')
        }
    },
    changePassword: async ({ request, locals }) => {
        const data = await request.formData()
        const newPassword = data.get('newPassword')?.toString()

        // Validate data
        if (!newPassword || newPassword.length < 8) {
            return fail(400, { message: 'Password must be at least 8 characters' })
        }

        // Current user
        const user = locals.currentUser
        if (!user) {
            return error(401, { message: 'Access denied' })
        }

        // Retrieve user credentials
        const userId = user.id
        const userCredentialsService = new UserCredentialsService()
        const userCredentials = await userCredentialsService.findByUserId(userId)
        if (!userCredentials) {
            return error(404, 'Invalid user credentials')
        }

        // Check that the new password is different from the old one
        if (await comparePasswords(newPassword, userCredentials.password)) {
            return error(400, 'New password must be different from the old one')
        }

        try {
            // Update password
            userCredentials.password = await hashPassword(newPassword)
            await userCredentials.save()

            return { ok: true, message: 'Successfully changed password' }
        } catch {
            return error(500, 'Failed to change password')
        }
    },
} satisfies Actions
