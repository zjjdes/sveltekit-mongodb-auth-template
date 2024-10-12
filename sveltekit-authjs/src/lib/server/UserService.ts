import CrudService from './CrudService'
import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema<App.User>(
    {
        name: { type: String, required: true },
        image: { type: String },
        email: { type: String, required: true, unique: true },
        emailVerified: { type: Boolean, default: false },
    },
    {
        collection: 'user',
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id
            },
        },
        toObject: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id
            },
        },
    }
)

const UserModel = mongoose.models.User || mongoose.model<App.User>('User', UserSchema)
export class UserService extends CrudService<App.User> {
    constructor() {
        super(UserModel)
    }

    // Find a user by email
    async findByEmail(email: string): Promise<App.User | null> {
        return this.model.findOne({ email })
    }
}
