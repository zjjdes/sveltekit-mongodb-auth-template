import type { PageServerLoad } from './$types'
import { fail, error, redirect, type Actions } from '@sveltejs/kit'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'
import { UserCredentialsService } from '$lib/server/UserCredentialsService'
import { hashPassword, comparePasswords } from '$lib/server/auth'

export const load = (async ({ url }) => {
    const userId = url.searchParams.get('userId')
    const token = url.searchParams.get('token')

    if (!userId || !token) {
        redirect(303, '/')
    }

    return { userId, token }
}) satisfies PageServerLoad

export const actions = {
    resetPassword: async ({ request, cookies, locals }) => {
        const data = await request.formData()
        const userId = data.get('userId') as string
        const token = data.get('token') as string
        const newPassword = data.get('newPassword') as string

        if (!userId || !token || !newPassword) {
            return fail(400, { ok: false, message: 'Invalid request' })
        }

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

            // Signout if authenticated
            cookies.delete('accessToken', { path: '/' })
            locals.currentUser = null

            return { ok: true, message: 'Password reset successful' }
        } catch {
            return error(500, 'Failed to reset password')
        }
    },
} satisfies Actions
