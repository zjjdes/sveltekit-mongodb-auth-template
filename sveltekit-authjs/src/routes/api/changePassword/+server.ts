import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { UserCredentialsService } from '$lib/server/UserCredentialsService'
import { hashPassword, comparePasswords } from '$lib/server/auth'

export const POST: RequestHandler = async ({ request, locals }) => {
    const data = await request.json()
    const { newPassword } = data

    // Current user
    const session = await locals.auth()
    const user = session && session.user

    if (!user) {
        return error(401, { message: 'Unauthorized' })
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

        return json(true)
    } catch {
        return error(500, 'Failed to reset password')
    }
}
