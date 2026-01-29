import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string; // Hashed
    name?: string;
    image?: string;
    githubId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Don't return password by default
    name: { type: String },
    image: { type: String },
    githubId: { type: String, unique: true, sparse: true },
}, {
    timestamps: true,
    collection: 'users'
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
