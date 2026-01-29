import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for a file or folder
interface IFileSystemItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;        // Only for files
    children?: string[];     // Only for folders - array of child IDs
    parentId?: string;       // Reference to parent folder (null/undefined for root items)
}

// Interface for the Room document
interface IRoom extends Document {
    roomId: string;
    files: IFileSystemItem[];
    elements: any[]; // Canvas elements
    updatedAt: Date;
}

const FileSystemItemSchema = new Schema<IFileSystemItem>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['file', 'folder'], default: 'file' },
    content: { type: String, default: '' },
    children: { type: [String] },
    parentId: { type: String },
});

const RoomSchema = new Schema<IRoom>({
    roomId: { type: String, required: true, unique: true },
    files: {
        type: [FileSystemItemSchema],
        default: [{ id: 'default', name: 'index.js', type: 'file', content: '// Welcome to DevSync\n// Start coding...' }]
    },
    elements: { type: Schema.Types.Mixed, default: [] } as any,
    updatedAt: { type: Date, default: Date.now },
}, { collection: 'roomData' });

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);