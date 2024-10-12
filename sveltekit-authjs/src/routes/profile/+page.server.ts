import type { PageServerLoad } from './$types'
import { fail, error, type Actions } from '@sveltejs/kit'
import { signIn, signOut } from '$lib/server/auth'
import { formData2Object } from '$lib/utils'
import { CredentialsSignin } from '@auth/sveltekit'

export const load = (async () => {
    return {}
}) satisfies PageServerLoad

export const actions = {
    signin: async event => {
        let res
        try {
            res = await signIn(event)
        } catch (err) {
            if (err instanceof CredentialsSignin) {
                return fail(401, { message: err.code })
            }

            /**
             * signIn() returns a redirect(), which will be caught as an error
             * must separate it from other errors by throwing it here
             */
            throw err
        }
        return res
    },
    signout: signOut,
    register: async ({ request, fetch }) => {
        const data = await request.formData()

        // Get data from form
        const newUser = formData2Object(data) as App.RegisterSchema

        // Validate data
        if (!newUser.password || newUser.password.length < 8) {
            return fail(400, { message: 'Password must be at least 8 characters' })
        }

        if (!newUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
            return fail(400, { message: 'Invalid email address' })
        }

        // Send request
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        })

        // Handle response
        if (!res.ok) {
            return fail(res.status, await res.json())
        }

        return { message: 'Registration successful, pending email verification' }
    },
    resetPassword: async ({ request, fetch }) => {
        const data = await request.formData()
        const email = data.get('email')?.toString()

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return fail(400, { message: 'Invalid email address' })
        }

        const res = await fetch('/api/sendResetPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })

        if (!res.ok) {
            error(res.status, await res.json())
        }

        return { message: 'Password reset email sent' }
    },
    changePassword: async ({ request, fetch }) => {
        const data = await request.formData()
        const newPassword = data.get('newPassword')?.toString()

        // Validate data
        if (!newPassword || newPassword.length < 8) {
            return fail(400, { message: 'Password must be at least 8 characters' })
        }

        const res = await fetch('/api/changePassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword }),
        })

        if (!res.ok) {
            error(res.status, await res.json())
        }

        return { message: 'Successfully changed password' }
    },
} satisfies Actions
