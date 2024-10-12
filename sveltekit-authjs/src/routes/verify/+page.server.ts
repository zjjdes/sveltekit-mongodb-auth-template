import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load = (async ({ url, fetch }) => {
    const userId = url.searchParams.get('userId')
    const verificationToken = url.searchParams.get('token')

    if (!verificationToken || !userId) {
        error(400, 'Invalid verification request')
    }

    const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token: verificationToken }),
    })

    const verified = await res.json()

    return { verified }
}) satisfies PageServerLoad
