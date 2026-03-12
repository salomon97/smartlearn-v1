import mongoose, { Schema, Document, models } from 'mongoose';

export interface IAdminToken extends Document {
    email: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

const AdminTokenSchema = new Schema<IAdminToken>(
    {
        email: { type: String, required: true },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Auto-suppression après 15 minutes (TTL index)
AdminTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.AdminToken || mongoose.model<IAdminToken>('AdminToken', AdminTokenSchema);
