import type { PageServerLoad } from './$types'
import { fail, error, redirect, type Actions } from '@sveltejs/kit'

export const load = (async ({ url }) => {
    const userId = url.searchParams.get('userId')
    const token = url.searchParams.get('token')

    if (!userId || !token) {
        redirect(303, '/')
    }

    return { userId, token }
}) satisfies PageServerLoad

export const actions = {
    resetPassword: async ({ request, fetch }) => {
        const data = await request.formData()
        const userId = data.get('userId')
        const token = data.get('token')
        const newPassword = data.get('newPassword')

        if (!userId || !token || !newPassword) {
            return fail(400, { message: 'Invalid request' })
        }

        const res = await fetch('/api/resetPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, token, newPassword }),
        })

        if (!res.ok) {
            error(res.status, await res.json())
        }

        redirect(303, '/profile')
    },
} satisfies Actions
