import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { UserService } from '$lib/server/UserService'
import { UserCredentialsService } from '$lib/server/UserCredentialsService'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'
import { sendResetPasswordEmail } from '$lib/server/email'

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json()
    const { email } = data

    const userService = new UserService()
    const user = await userService.findByEmail(email)

    if (!user) {
        error(404, 'User not found')
    }

    const userId = user.id
    const userCredentialsService = new UserCredentialsService()
    const userCredentials = await userCredentialsService.findByUserId(userId)

    if (!userCredentials) {
        error(404, 'User credentials not found')
    }

    const verificationTokenService = new VerificationTokenService()
    const token = (await verificationTokenService.createOrUpdateToken(userId)).token

    if (await sendResetPasswordEmail(user.email, userId, token)) {
        return json({ message: 'Password reset email sent' })
    } else {
        error(500, 'Failed to send password reset email')
    }
}
