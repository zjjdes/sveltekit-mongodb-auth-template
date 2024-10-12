import CrudService from './CrudService'
import mongoose, { Schema } from 'mongoose'

const UserCredentialsSchema = new Schema<App.UserCredentials>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        password: { type: String, required: true },
    },
    {
        collection: 'userCredentials',
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

const UserCredentialsModel =
    mongoose.models.UserCredentials ||
    mongoose.model<App.UserCredentials>('UserCredentials', UserCredentialsSchema)
export class UserCredentialsService extends CrudService<App.UserCredentials> {
    constructor() {
        super(UserCredentialsModel)
    }

    async findByUserId(userId: string): Promise<App.UserCredentials | null> {
        const userCredentials = await this.model.findOne({ userId })
        return userCredentials
    }
}
