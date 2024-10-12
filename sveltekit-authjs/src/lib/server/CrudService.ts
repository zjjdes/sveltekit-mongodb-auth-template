import mongoose, { Document, Model } from 'mongoose'
import type { FilterQuery, ProjectionType } from 'mongoose'
import { MONGODB_URI } from '$env/static/private'

export default class CrudService<T extends Document> {
    protected model: Model<T>

    constructor(model: Model<T>) {
        this.model = model
        this.init()
    }

    // Initialize the database connection
    private async init() {
        if (mongoose.connection.readyState === 0) {
            try {
                await mongoose.connect(MONGODB_URI)
                console.log('Connected to MongoDB')
            } catch (error) {
                console.error('Failed to connect to MongoDB:', error)
                throw error
            }
        }
    }

    // Create a new document
    async create(data: Partial<T>): Promise<T> {
        const newDocument = new this.model(data)
        await newDocument.save()
        return newDocument
    }

    // Read all documents with optional filtering and excluding fields
    async find(filter: FilterQuery<T> = {}, exclude: (keyof T)[] = []): Promise<T[]> {
        // Create the projection to exclude fields
        const projection = exclude.reduce(
            (proj, field) => {
                proj[field] = 0
                return proj
            },
            {} as Record<keyof T, 0>
        ) as ProjectionType<T>

        return await this.model.find(filter, projection)
    }

    // Read a single document by ID
    async findById(id: string): Promise<T | null> {
        const document = await this.model.findById(id)
        return document
    }

    // Update a document by ID
    async updateById(id: string, updateData: Partial<T>): Promise<T | null> {
        const updatedDocument = await this.model.findByIdAndUpdate(id, updateData, {
            new: true,
        })
        return updatedDocument
    }

    // Delete a document by ID
    async deleteById(id: string): Promise<T | null> {
        const deletedDocument = await this.model.findByIdAndDelete(id)
        return deletedDocument
    }

    // Count documents in the collection based on a filter
    async count(filter: FilterQuery<T> = {}): Promise<number> {
        return this.model.countDocuments(filter)
    }
}
