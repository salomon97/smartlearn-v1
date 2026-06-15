import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    password?: string;
    isPremium: boolean;          // Drapeau "a déjà payé un jour" — JAMAIS reset à false
    premiumUntil?: Date | null;  // Horloge d'expiration. null = grandfather à vie. Cf computePremiumStatus
    role: 'student' | 'affiliate' | 'admin';
    grade_level?: string;
    school?: string;
    phone?: string; // Numéro de téléphone (Cameroun +237…) — canal SMS futur
    sessionId?: string;
    isVerified: boolean;
    image?: string;
    commission_rate?: number;
    parrainId?: string;
    codeAffiliation?: string;
    resetPasswordOtp?: string;
    resetPasswordExpires?: Date;
    registrationIp?: string;
    welcomeTrialGrantedAt?: Date | null;
    registrationFraudFlag?: {
        ipCount24h: number;
        flaggedAt: Date;
    } | null;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String }, // For credentials auth, not needed if using OAuth
        isPremium: { type: Boolean, default: false },
        premiumUntil: { type: Date, default: null },
        role: { type: String, enum: ['student', 'affiliate', 'admin'], default: 'student' },
        grade_level: { type: String }, // Optionnel car les affiliés n'ont pas de classe
        school: { type: String },      // Établissement (ex: Collège Laval)
        phone: { type: String },       // Téléphone (+237…) — requis pour les nouvelles inscriptions
        sessionId: { type: String },
        isVerified: { type: Boolean, default: false },
        image: { type: String }, // URL de la photo de profil
        commission_rate: { type: Number, default: 10 }, // Le pourcentage (10%)
        parrainId: { type: String },
        codeAffiliation: { type: String },
        resetPasswordOtp: { type: String },
        resetPasswordExpires: { type: Date },
        registrationIp: { type: String },
        welcomeTrialGrantedAt: { type: Date, default: null },
        registrationFraudFlag: {
            type: {
                ipCount24h: { type: Number },
                flaggedAt: { type: Date },
            },
            default: null,
            _id: false,
        },
        lastLoginAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export default models.User || mongoose.model<IUser>('User', UserSchema);
