import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUserProgress extends Document {
    userId: string;
    courseId: string;
    lessonId: string;
    isCompleted: boolean;
    completedAt?: Date;
    lastWatchedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
    {
        userId: { type: String, required: true },
        courseId: { type: String, required: true },
        lessonId: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date },
        lastWatchedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index for fast lookups: 'Which lessons has this user completed in this course?'
UserProgressSchema.index({ userId: 1, courseId: 1 });
UserProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
