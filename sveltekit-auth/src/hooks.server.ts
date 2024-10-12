import { error, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { decodeAccessToken, createAccessToken } from '$lib/server/auth'
import { UserService } from '$lib/server/UserService'
import { AUTH_MAXAGE } from '$env/static/private'

const authenticationHandle = (async ({ event, resolve }) => {
    // Validate and renew accessToken
    const accessToken = event.cookies.get('accessToken')
    if (!accessToken) {
        event.cookies.delete('accessToken', { path: '/' })
        event.locals.currentUser = null
        return resolve(event)
    }

    try {
        // Decode token
        const { userId, exp } = decodeAccessToken(accessToken)

        // Retrieve user
        const userService = new UserService()
        const validatedUser: App.User | null = (await userService.findById(userId))?.toObject()

        // Retrieve token expiration time
        const expiresAt = new Date(exp)

        // Invalidate if user does not exist or token has expired
        if (!validatedUser || expiresAt < new Date()) {
            event.cookies.delete('accessToken', { path: '/' })
            event.locals.currentUser = null
        }

        // Sign and save new token
        const newToken = createAccessToken(userId)
        event.cookies.set('accessToken', newToken, { path: '/', maxAge: Number(AUTH_MAXAGE) })
        event.locals.currentUser = validatedUser
    } catch {
        event.cookies.delete('accessToken', { path: '/' })
        event.locals.currentUser = null
    }

    return resolve(event)
}) satisfies Handle

const authorizationHandle = (async ({ event, resolve }) => {
    // Protect routes
    const protectedRoutes = ['/protected']
    if (protectedRoutes.some(route => event.url.pathname.includes(route))) {
        const currentUser = await event.locals.currentUser

        if (!currentUser) {
            error(401, 'Access denied')
        }
    }

    return resolve(event)
}) satisfies Handle

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle = sequence(authenticationHandle, authorizationHandle) satisfies Handle
