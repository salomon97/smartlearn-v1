import mongoose, { Schema, Document, models } from 'mongoose';

export interface IDriveMapping extends Document {
    grade_level: string;     // e.g. '6e', '1ère_C', 'TleTI'
    subject: string;         // 'Mathématiques' or 'Informatique'
    contentType: 'chapters' | 'evaluations' | 'annales_officiels' | 'annales_blancs' | 'library_manuals' | 'library_ref' | 'root';
    folderId: string;        // ID Google Drive
    path: string;            // Chemin relatif pour debug
    playlistId?: string;     // ID Playlist YouTube (optionnel)
    createdAt: Date;
    updatedAt: Date;
}

const DriveMappingSchema = new Schema<IDriveMapping>(
    {
        grade_level: { type: String, required: true },
        subject: { type: String, required: true },
        contentType: { 
            type: String, 
            required: true, 
            enum: ['chapters', 'evaluations', 'annales_officiels', 'annales_blancs', 'library_manuals', 'library_ref', 'root'] 
        },
        folderId: { type: String, required: true },
        path: { type: String },
        playlistId: { type: String },
    },
    { timestamps: true }
);

// Index pour recherche rapide
DriveMappingSchema.index({ grade_level: 1, subject: 1, contentType: 1 });

export default models.DriveMapping || mongoose.model<IDriveMapping>('DriveMapping', DriveMappingSchema);
