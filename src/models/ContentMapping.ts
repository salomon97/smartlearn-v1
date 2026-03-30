import mongoose, { Schema, Document, models } from 'mongoose';

export interface IContentMapping extends Document {
    grade_level: string;     // e.g. '6e', '1ère_C', 'TleTI'
    subject: string;         // 'Mathématiques' or 'Informatique'
    contentType: 'chapters' | 'evaluations' | 'annales_officiels' | 'annales_blancs' | 'library_manuals' | 'library_ref' | 'videos';
    bunnyStoragePath?: string; // ID Google Drive -> Remplacé par le chemin du dossier sur Bunny Storage (ex: /6e/Mathematiques/Chapitres/)
    bunnyCollectionId?: string; // ID de la Collection vidéo dans Bunny Stream (ex: 6ecaf281-9b...)
    createdAt: Date;
    updatedAt: Date;
}

const ContentMappingSchema = new Schema<IContentMapping>(
    {
        grade_level: { type: String, required: true },
        subject: { type: String, required: true },
        contentType: { 
            type: String, 
            required: true, 
            enum: ['chapters', 'evaluations', 'annales_officiels', 'annales_blancs', 'library_manuals', 'library_ref', 'videos'] 
        },
        bunnyStoragePath: { type: String, required: false },
        bunnyCollectionId: { type: String, required: false },
    },
    { timestamps: true }
);

// Index pour recherche rapide
ContentMappingSchema.index({ grade_level: 1, subject: 1, contentType: 1 });

export default models.ContentMapping || mongoose.model<IContentMapping>('ContentMapping', ContentMappingSchema);
