import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWithdrawalHistory extends Document {
  affiliateId: mongoose.Types.ObjectId;
  affiliateName: string;
  affiliateEmail: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalHistorySchema: Schema<IWithdrawalHistory> = new Schema(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    affiliateName: {
      type: String,
      required: true,
    },
    affiliateEmail: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "Mobile Money",
    },
    status: {
      type: String,
      enum: ["paid", "failed"],
      default: "paid",
    },
  },
  {
    timestamps: true,
  }
);

// Pour éviter les redéfinitions lors du rechargement à chaud (hot reloading)
const WithdrawalHistory: Model<IWithdrawalHistory> = 
  mongoose.models.WithdrawalHistory || mongoose.model<IWithdrawalHistory>("WithdrawalHistory", WithdrawalHistorySchema);

export default WithdrawalHistory;
