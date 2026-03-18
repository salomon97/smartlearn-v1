import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import ManualStudentRegistration from "./components/ManualStudentRegistration";
import StudentsList from "./components/StudentsList";

export default async function AdminStudentsPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // Récupérer les 100 derniers élèves (plus large pour le tri)
    const studentsRaw = await User.find({ role: 'student' })
                               .sort({ createdAt: -1 })
                               .limit(100)
                               .lean();
    
    // Convertir les IDs en string pour le client
    const students = studentsRaw.map((s: any) => ({
        ...s, 
        _id: s._id.toString(),
        createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString()
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Gestion des Élèves</h1>
                    <p className="text-gray-500 font-medium">Inscrivez vos élèves, gérez les accès VIP et organisez par salle.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Bloc 1 : Inscription Rapide */}
                <div className="xl:col-span-1">
                    <ManualStudentRegistration />
                </div>

                {/* Bloc 2 : Liste Interactive */}
                <div className="xl:col-span-3">
                    <StudentsList initialStudents={students as any} />
                </div>
            </div>
        </div>
    );
}
