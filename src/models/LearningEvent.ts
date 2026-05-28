import mongoose, { Schema, Document, models } from 'mongoose';

export type LearningEventType =
  | 'login'
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'payment_succeeded';

export interface ILearningEvent extends Document {
  userId: string;
  tenantId?: string; // forward-compat multi-tenant (non utilisé tant que School n'existe pas)
  type: LearningEventType;
  courseId?: string;
  lessonId?: string;
  value?: number;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LearningEventSchema = new Schema<ILearningEvent>(
  {
    userId: { type: String, required: true },
    tenantId: { type: String },
    type: {
      type: String,
      enum: ['login', 'lesson_started', 'lesson_completed', 'quiz_submitted', 'payment_succeeded'],
      required: true,
    },
    courseId: { type: String },
    lessonId: { type: String },
    value: { type: Number },
    occurredAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, collection: 'learning_events' },
);

LearningEventSchema.index({ userId: 1, occurredAt: -1 });
LearningEventSchema.index({ type: 1, occurredAt: -1 });

export default models.LearningEvent || mongoose.model<ILearningEvent>('LearningEvent', LearningEventSchema);
