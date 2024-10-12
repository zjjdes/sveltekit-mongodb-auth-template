import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { VerificationTokenService } from '$lib/server/VerificationTokenService'

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json()
    const userId: string = data.userId
    const verificationToken: string = data.token

    const verificationTokenService = new VerificationTokenService()
    const verified = await verificationTokenService.verifyEmail(userId, verificationToken)

    return json(verified)
}
