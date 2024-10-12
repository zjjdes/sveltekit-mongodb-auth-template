import { Google } from 'arctic'
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from '$env/static/private'

export const google = new Google(
    AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET,
    'http://localhost:5173/auth/google/callback' // hardcoded
)
