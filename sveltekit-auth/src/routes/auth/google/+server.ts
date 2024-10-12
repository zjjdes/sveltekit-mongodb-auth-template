import type { RequestHandler, RequestEvent } from './$types'
import { redirect } from '@sveltejs/kit'
import { google } from '$lib/server/oauth'
import { generateCodeVerifier, generateState } from 'arctic'
import { AUTH_MAXAGE } from '$env/static/private'

export const GET: RequestHandler = async (event: RequestEvent) => {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email'])

    event.cookies.set('google_oauth_state', state, { path: '/', maxAge: Number(AUTH_MAXAGE) })
    event.cookies.set('google_code_verifier', codeVerifier, {
        path: '/',
        maxAge: Number(AUTH_MAXAGE),
    })

    redirect(302, url.toString())
}
