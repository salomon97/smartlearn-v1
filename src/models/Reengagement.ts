import mongoose, { Schema, Document, models } from 'mongoose';

export type ReengagementStatus = 'active' | 'recovered' | 'completed' | 'stopped';

export interface IReengagement extends Document {
  userId: string;
  tenantId?: string;
  sequenceStep: number; // 1..3
  status: ReengagementStatus;
  triggeredAt: Date;
  lastStepAt: Date;
  recoveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReengagementSchema = new Schema<IReengagement>(
  {
    userId: { type: String, required: true },
    tenantId: { type: String },
    sequenceStep: { type: Number, required: true, default: 1, min: 1, max: 3 },
    status: {
      type: String,
      enum: ['active', 'recovered', 'completed', 'stopped'],
      required: true,
      default: 'active',
    },
    triggeredAt: { type: Date, required: true, default: Date.now },
    lastStepAt: { type: Date, required: true, default: Date.now },
    recoveredAt: { type: Date },
  },
  { timestamps: true, collection: 'reengagements' },
);

ReengagementSchema.index({ userId: 1, status: 1 });
ReengagementSchema.index({ status: 1, lastStepAt: 1 });

export default models.Reengagement || mongoose.model<IReengagement>('Reengagement', ReengagementSchema);
