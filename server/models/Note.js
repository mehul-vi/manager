import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        content: { type: String, default: '' }, // frontend sends 'content', not 'description'
    },
    { timestamps: true }
);

export default mongoose.model('Note', noteSchema);