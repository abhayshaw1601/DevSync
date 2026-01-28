import mongoose, { Schema, model, models } from 'mongoose';

const RoomSchema = new Schema({
    roomId: { type: String, required: true, unique: true },
    code: { type: String, default: "// Start coding..." },
    language: { type: String, default: "javascript" },
    // We will add 'elements' for the whiteboard here later!
    updatedAt: { type: Date, default: Date.now },
}, { collection: 'roomData' });


export const Room = models.Room || model('Room', RoomSchema);