import { getGoogleAuth } from '@/lib/googleAuth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        // Vérification Premium (Anti-fraude)
        const user = session.user as any;
        if (!user.isPremium && user.role !== 'admin') {
            return NextResponse.json({ message: "Accès Premium requis pour voir ce contenu" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const folderId = searchParams.get('folderId');

        if (!folderId) {
            return NextResponse.json({ message: "Folder ID requis" }, { status: 400 });
        }

        const auth = await getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, iconLink)',
            orderBy: 'name',
        });

        return NextResponse.json({
            files: response.data.files || []
        });

    } catch (error: any) {
        console.error("❌ [DRIVE API] Erreur :", error.message);
        return NextResponse.json({ message: "Erreur lors de la lecture du Drive", error: error.message }, { status: 500 });
    }
}
