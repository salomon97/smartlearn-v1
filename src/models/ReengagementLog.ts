import mongoose, { Schema, Document, models } from 'mongoose';

export interface IReengagementLog extends Document {
  userId: string;
  step: number;
  channel: string; // 'email' | 'sms' (sms branché plus tard)
  subject: string;
  body: string;
  sentAt: Date;
  provider: string; // 'nodemailer' | 'log' | 'africastalking'...
  delivered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReengagementLogSchema = new Schema<IReengagementLog>(
  {
    userId: { type: String, required: true },
    step: { type: Number, required: true },
    channel: { type: String, required: true, default: 'email' },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sentAt: { type: Date, required: true, default: Date.now },
    provider: { type: String, default: 'log' },
    delivered: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'reengagement_logs' },
);

ReengagementLogSchema.index({ userId: 1, sentAt: -1 });

export default models.ReengagementLog || mongoose.model<IReengagementLog>('ReengagementLog', ReengagementLogSchema);
