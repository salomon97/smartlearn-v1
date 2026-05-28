import mongoose, { Schema, Document, models } from 'mongoose';
import type { HealthStatus } from '../lib/retention-core';

export interface IStudentHealth extends Document {
  userId: string;
  tenantId?: string;
  score: number;
  status: HealthStatus;
  recencyDays: number;
  activeDays14: number;
  lessonsCompleted14: number;
  lastActivityAt?: Date;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentHealthSchema = new Schema<IStudentHealth>(
  {
    userId: { type: String, required: true, unique: true },
    tenantId: { type: String },
    score: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['healthy', 'cooling', 'at_risk', 'churned'],
      required: true,
      default: 'churned',
    },
    recencyDays: { type: Number, default: 0 },
    activeDays14: { type: Number, default: 0 },
    lessonsCompleted14: { type: Number, default: 0 },
    lastActivityAt: { type: Date },
    computedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, collection: 'student_health' },
);

StudentHealthSchema.index({ status: 1 });

export default models.StudentHealth || mongoose.model<IStudentHealth>('StudentHealth', StudentHealthSchema);
