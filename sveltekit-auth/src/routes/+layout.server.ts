import type { LayoutServerLoad } from './$types'

export const load = (async ({ locals }) => {
    return { currentUser: locals.currentUser }
}) satisfies LayoutServerLoad

export const csr = false // disable client-side rendering to test SSR
