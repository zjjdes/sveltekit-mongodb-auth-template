import CrudService from '$lib/server/CrudService'
import mongoose, { Schema } from 'mongoose'
import { UserService } from '$lib/server/UserService'
import crypto from 'crypto'
import { error } from '@sveltejs/kit'

const VerificationTokenSchema = new Schema<App.VerificationToken>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        token: { type: String, required: true },
        expires: { type: Date, default: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) },
    },
    {
        collection: 'verificationToken',
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id
                ret.userId = ret.userId.toString()
            },
        },
        toObject: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id
                ret.userId = ret.userId.toString()
            },
        },
    }
)

const VerificationTokenModel =
    mongoose.models.VerificationToken ||
    mongoose.model<App.VerificationToken>('VerificationToken', VerificationTokenSchema)
export class VerificationTokenService extends CrudService<App.VerificationToken> {
    constructor() {
        super(VerificationTokenModel)
    }

    async createOrUpdate(userId: string): Promise<App.VerificationToken> {
        const token = crypto.randomBytes(32).toString('hex')
        const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

        const existingToken = await this.model.findOne({ userId })
        if (existingToken) {
            existingToken.token = token
            existingToken.expires = expires
            await existingToken.save()
            return existingToken
        } else {
            return await this.model.create({ userId, token, expires })
        }
    }

    async verify(userId: string, verificationToken: string): Promise<boolean> {
        const token = await this.model.findOne({ token: verificationToken })
        if (!token || String(token.userId) !== userId) {
            error(404, 'Invalid verification token')
        }

        if (token.expires < new Date()) {
            error(400, 'Verification token expired')
        }

        return true
    }

    async verifyEmail(userId: string, verificationToken: string): Promise<boolean> {
        const token = await this.model.findOne({ token: verificationToken })
        if (!token || String(token.userId) !== userId) {
            error(404, 'Invalid verification token')
        }

        if (token.expires < new Date()) {
            error(400, 'Verification token expired')
        }

        const userService = new UserService()
        const user = await userService.findById(userId)
        if (!user) {
            error(404, 'User not found')
        }

        user.emailVerified = true
        await user.save()
        await token.deleteOne()

        return true
    }

    async deleteToken(verificationToken: string): Promise<void> {
        await this.model.deleteOne({ token: verificationToken })
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.model.deleteMany({ userId })
    }
}
