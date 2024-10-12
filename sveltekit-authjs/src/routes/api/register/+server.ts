import type { RequestHandler } from './$types'
import { UserService } from '$lib/server/UserService'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'
import { UserCredentialsService } from '$lib/server/UserCredentialsService'
import { json, error } from '@sveltejs/kit'
import { sendVerificationEmail } from '$lib/server/email'
import { hashPassword } from '$lib/server/auth'

// Implement Credentials registration separately as Auth.js does not support it
export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json()

    const userService = new UserService()
    const userCredentialsService = new UserCredentialsService()

    // Check if user exists
    let newUser = await userService.findByEmail(data.email)

    // Create user if not found
    if (!newUser) {
        newUser = await userService.create(data)
    }

    const userCredentials = await userCredentialsService.findByUserId(newUser.id)

    // Check if user exists: email is verified or credentials exist
    if (newUser.emailVerified || userCredentials) {
        error(400, 'User already exists')
    }

    // Create credentials for new user
    await userCredentialsService.create({
        userId: newUser.id,
        password: await hashPassword(String(data.password)),
    } as App.UserCredentials)

    // Create and save verification token
    const verificationTokenService = new VerificationTokenService()
    const verificationToken = (await verificationTokenService.createOrUpdateToken(newUser.id)).token

    // Send verification email
    if (await sendVerificationEmail(newUser.email, newUser.id, verificationToken)) {
        return json({ message: 'Verification email sent' })
    } else {
        error(400, 'Failed to send verification email')
    }
}
