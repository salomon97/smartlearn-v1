import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITransaction extends Document {
    userId: string;
    parrainId?: string;
    amount: number;
    commission: number;
    status: 'pending' | 'cleared' | 'failed';
    paymentMethod: string;
    referenceId?: string; // e.g. transaction ID from Chariow
    clearingDate: Date; // Date + 72h
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: { type: String, required: true },
        parrainId: { type: String },
        amount: { type: Number, required: true },
        commission: { type: Number, default: 0 },
        status: { type: String, enum: ['pending', 'cleared', 'failed'], default: 'pending' },
        paymentMethod: { type: String, default: 'Chariow' },
        referenceId: { type: String },
        clearingDate: { type: Date, required: true },
    },
    { timestamps: true }
);

export default models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
