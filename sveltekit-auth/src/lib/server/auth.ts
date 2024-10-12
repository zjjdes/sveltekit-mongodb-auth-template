import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { AUTH_SECRET, AUTH_MAXAGE, AUTH_SALT_ROUNDS } from '$env/static/private'

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(AUTH_SALT_ROUNDS))
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
}

export function createAccessToken(userId: string): string {
    return jwt.sign({ userId }, AUTH_SECRET, { expiresIn: Number(AUTH_MAXAGE) })
}

export function decodeAccessToken(token: string): App.JwtPayload {
    return jwt.verify(token, AUTH_SECRET) as App.JwtPayload
}
