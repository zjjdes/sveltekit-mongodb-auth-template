import type { LayoutServerLoad } from './$types'

export const load = (async ({ locals }) => {
    return { session: await locals.auth() }
}) satisfies LayoutServerLoad

export const csr = false // disable client-side rendering to test Auth.js on server side
