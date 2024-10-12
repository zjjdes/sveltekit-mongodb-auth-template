// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Document } from 'mongoose'

declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}

        interface User extends Document {
            id: string
            name: string // TODO: make required after DB migration (firstName & lastName -> name)
            image?: string // TODO: DB migration (avatar -> image)
            email: string
            emailVerified: boolean
            // TODO: complete the fields
        }

        interface UserCredentials extends Document {
            id: string
            userId: mongoose.Types.ObjectId
            password: string
        }

        interface VerificationToken extends Document {
            id: string
            userId: mongoose.Types.ObjectId
            token: string
            expires: Date
        }

        interface RegisterSchema {
            email: string
            password: string
            name: string
        }
    }
}

export {}
