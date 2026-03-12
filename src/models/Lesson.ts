import mongoose, { Schema, Document, models } from 'mongoose';

export interface ILesson extends Document {
    title: string;
    courseId: mongoose.Types.ObjectId;
    videoUrl?: string; // e.g. YouTube or secure video ID
    pdfUrl?: string;
    order: number;
    isFreePreview: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
    {
        title: { type: String, required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        videoUrl: { type: String },
        pdfUrl: { type: String },
        order: { type: Number, default: 0 },
        isFreePreview: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
