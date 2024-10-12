import type { RequestHandler } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { type OAuth2Tokens, decodeIdToken } from 'arctic'
import { ObjectParser } from '@pilcrowjs/object-parser'
import { google } from '$lib/server/oauth'
import { UserService } from '$lib/server/UserService'
import { UserIdentityService } from '$lib/server/UserIdentityService'
import { createAccessToken } from '$lib/server/auth'
import { AUTH_MAXAGE } from '$env/static/private'

export const GET: RequestHandler = async ({ url, cookies }) => {
    const storedState = cookies.get('google_oauth_state') ?? null
    const codeVerifier = cookies.get('google_code_verifier') ?? null
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    // Check that the state in the URL matches the one that's stored
    if (
        storedState === null ||
        codeVerifier === null ||
        code === null ||
        state === null ||
        storedState !== state
    ) {
        error(400, 'Please restart the process.')
    }

    // Validate the authorization code and stored code verifier
    let tokens: OAuth2Tokens
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier)
    } catch {
        error(400, 'Please restart the process.')
    }

    // Retrieve user details from provider
    // Can get other fields if needed
    const claims = decodeIdToken(tokens.idToken())
    const claimsParser = new ObjectParser(claims)

    const email = claimsParser.getString('email')
    const name = claimsParser.getString('name')
    const image = claimsParser.getString('picture')
    const googleId = claimsParser.getString('sub')

    // If user exists and has current OAuth identity, log in
    const userIdentityService = new UserIdentityService()
    const existingUser = await userIdentityService.findUserByGoogleId(googleId)
    if (existingUser) {
        const accessToken = createAccessToken(existingUser.id)
        cookies.set('accessToken', accessToken, { path: '/', maxAge: Number(AUTH_MAXAGE) })

        redirect(302, '/')
    }

    // If use exists but does not have current identity, link and log in
    const unlinkedUser = await new UserService().findByEmail(email)
    if (unlinkedUser) {
        await userIdentityService.create({
            userId: unlinkedUser.id,
            provider: 'google',
            providerAccountId: googleId,
        })

        // Check if user data needs to be updated
        if (!unlinkedUser.image) {
            unlinkedUser.image = image
            unlinkedUser.save()
        }

        const accessToken = createAccessToken(unlinkedUser.id)
        cookies.set('accessToken', accessToken, { path: '/', maxAge: Number(AUTH_MAXAGE) })

        redirect(302, '/')
    }

    // If user does not exist, create user, userIdentity and log in
    const userService = new UserService()
    const user = await userService.create({ email, name, image })
    await userIdentityService.create({
        userId: user.id,
        provider: 'google',
        providerAccountId: googleId,
    })

    const accessToken = createAccessToken(user.id)
    cookies.set('accessToken', accessToken, { path: '/', maxAge: Number(AUTH_MAXAGE) })

    redirect(302, '/')
}
