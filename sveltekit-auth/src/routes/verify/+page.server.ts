import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'

export const load = (async ({ url }) => {
    const userId = url.searchParams.get('userId')
    const verificationToken = url.searchParams.get('token')

    if (!verificationToken || !userId) {
        error(400, 'Invalid verification request')
    }

    const verificationTokenService = new VerificationTokenService()
    const verified = await verificationTokenService.verifyEmail(userId, verificationToken)

    return { verified }
}) satisfies PageServerLoad
