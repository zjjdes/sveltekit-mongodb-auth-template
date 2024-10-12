import CrudService from './CrudService'
import mongoose, { Schema } from 'mongoose'
import { UserService } from '$lib/server/UserService'

const UserIdentitySchema = new Schema<App.UserIdentity>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        provider: { type: String, required: true },
        providerAccountId: { type: String, required: true },
    },
    {
        collection: 'userIdentity',
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

const UserIdentityModel =
    mongoose.models.UserIdentity ||
    mongoose.model<App.UserIdentity>('UserIdentity', UserIdentitySchema)
export class UserIdentityService extends CrudService<App.UserIdentity> {
    constructor() {
        super(UserIdentityModel)
    }

    async findUserByGoogleId(googleId: string): Promise<App.User | null> {
        const userIdentity = (
            await this.model.findOne({ providerAccountId: googleId })
        )?.toJSON() as App.UserIdentity | null
        const userId = userIdentity?.userId

        if (!userId) {
            return null
        }

        const userService = new UserService()
        const user = await userService.findById(userId)

        return user
    }
}
