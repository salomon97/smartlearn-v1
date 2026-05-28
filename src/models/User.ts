import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    password?: string;
    isPremium: boolean;
    role: 'student' | 'affiliate' | 'admin';
    grade_level?: string;
    school?: string;
    sessionId?: string;
    isVerified: boolean;
    image?: string;
    commission_rate?: number;
    parrainId?: string;
    codeAffiliation?: string;
    resetPasswordOtp?: string;
    resetPasswordExpires?: Date;
    registrationIp?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String }, // For credentials auth, not needed if using OAuth
        isPremium: { type: Boolean, default: false },
        role: { type: String, enum: ['student', 'affiliate', 'admin'], default: 'student' },
        grade_level: { type: String }, // Optionnel car les affiliés n'ont pas de classe
        school: { type: String },      // Établissement (ex: Collège Laval)
        sessionId: { type: String },
        isVerified: { type: Boolean, default: false },
        image: { type: String }, // URL de la photo de profil
        commission_rate: { type: Number, default: 10 }, // Le pourcentage (10%)
        parrainId: { type: String },
        codeAffiliation: { type: String },
        resetPasswordOtp: { type: String },
        resetPasswordExpires: { type: Date },
        registrationIp: { type: String },
    },
    { timestamps: true }
);

export default models.User || mongoose.model<IUser>('User', UserSchema);
