import mongoose, { Schema, Document, models } from 'mongoose';

export type PlanPeriod = 'monthly' | 'quarterly' | 'annual' | 'lifetime';

export interface IPlan extends Document {
  code: string;
  name: string;
  price: number;
  chariowUrl: string;
  isActive: boolean;
  // Optionnels pour rétro-compat avec le legacy 'vip_avie' (qui n'a ni period ni durationDays).
  // Tous les nouveaux plans DOIVENT être créés avec period + durationDays.
  period?: PlanPeriod;
  durationDays?: number; // 30 / 90 / 365 ; absent / null = lifetime
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    chariowUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    period: { type: String, enum: ['monthly', 'quarterly', 'annual', 'lifetime'] },
    durationDays: { type: Number },
  },
  { timestamps: true },
);

export default models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
