import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { UserCredentialsService } from '$lib/server/UserCredentialsService'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'
import { hashPassword, comparePasswords } from '$lib/server/auth'

export const POST: RequestHandler = async ({ request, cookies }) => {
    const data = await request.json()
    const { userId, token, newPassword } = data

    // Check that the token is valid
    const verificationTokenService = new VerificationTokenService()
    const verified = await verificationTokenService.verify(userId, token)
    if (!verified) {
        return error(400, 'Invalid verification token')
    }

    // Retrieve user credentials
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

        // Delete token after use
        await verificationTokenService.deleteToken(token)

        // Signout by removing cookies
        cookies.delete('authjs.session-token', { path: '/' })
        cookies.delete('authjs.callback-url', { path: '/' })

        return json(true)
    } catch {
        return error(500, 'Failed to reset password')
    }
}
