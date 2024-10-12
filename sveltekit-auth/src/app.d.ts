// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Document } from 'mongoose'

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            currentUser?: User | null
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}

        interface User extends Document {
            id: string
            name: string
            image?: string
            email: string
            emailVerified: boolean
        }

        interface UserCredentials extends Document {
            id: string
            userId: mongoose.Types.ObjectId
            password: string
        }

        interface UserIdentity extends Document {
            id: string
            userId: mongoose.Types.ObjectId
            provider: string
            providerAccountId: string
        }

        interface VerificationToken extends Document {
            id: string
            userId: mongoose.Types.ObjectId
            token: string
            expires: Date
        }

        type JwtPayload = {
            userId: string
            iat: number
            exp: number
        }

        type RegisterSchema = {
            email: string
            password: string
            name: string
        }
    }
}

export {}
