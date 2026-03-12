import mongoose, { Schema, Document, models } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    grade_level: string;
    imageUrl: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        grade_level: { type: String, required: true },
        imageUrl: { type: String },
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default models.Course || mongoose.model<ICourse>('Course', CourseSchema);
