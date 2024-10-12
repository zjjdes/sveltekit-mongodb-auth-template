import { error, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { handle as authenticationHandle } from '$lib/server/auth'

const authorizationHandle = (async ({ event, resolve }) => {
    // Protect routes
    const protectedRoutes = ['/protected']
    if (protectedRoutes.some(route => event.url.pathname.includes(route))) {
        const session = await event.locals.auth()

        if (!session?.user) {
            error(401, 'Access denied')
        }
    }

    return resolve(event)
}) satisfies Handle

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle = sequence(authenticationHandle, authorizationHandle) satisfies Handle
