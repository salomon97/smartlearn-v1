import mongoose, { Schema, Document, models } from 'mongoose';

export interface IVerificationCode extends Document {
    userId: mongoose.Types.ObjectId;
    code: string;
    expiresAt: Date;
    createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        code: { type: String, required: true },
        // On définit une date d'expiration pour MongoDB TTL (Time-To-Live)
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Index TTL : supprime automatiquement le document quand 'expiresAt' est atteint
// Note: MongoDB nettoie en arrière-plan (peut prendre jusqu'à 60s)
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.VerificationCode || mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
