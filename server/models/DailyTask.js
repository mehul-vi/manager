import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        date: { type: String, default: () => new Date().toISOString().split('T')[0] }, // Format: YYYY-MM-DD
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        completed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('DailyTask', dailyTaskSchema);