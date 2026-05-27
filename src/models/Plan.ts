import mongoose, { Schema, Document, models } from 'mongoose';

export interface IPlan extends Document {
  code: string;
  name: string;
  price: number;
  chariowUrl: string;
  isActive: boolean;
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
  },
  { timestamps: true },
);

export default models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
