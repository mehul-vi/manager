import mongoose from 'mongoose';

const monthlyTaskSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        targetMonth: { type: String, default: () => new Date().toISOString().slice(0, 7) }, // Format: YYYY-MM
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        completed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('MonthlyTask', monthlyTaskSchema);