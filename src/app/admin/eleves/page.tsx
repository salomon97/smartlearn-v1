import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import ManualStudentRegistration from "./components/ManualStudentRegistration";

export default async function AdminStudentsPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // Récupérer les 50 derniers élèves
    const studentsRaw = await User.find({ role: 'student' })
                               .sort({ createdAt: -1 })
                               .limit(50)
                               .lean();
    
    const students = studentsRaw.map((s: any) => ({...s, _id: s._id.toString()}));

    const vipCount = students.filter(s => s.isPremium).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Élèves</h1>
                <p className="text-gray-500">Inscrivez manuellement des élèves (ex: contrats écoles) et consultez la liste.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bloc 1 : Formulaire d'inscription manuelle (Client Component) */}
                <div className="lg:col-span-1">
                    <ManualStudentRegistration />
                </div>

                {/* Bloc 2 : Liste des élèves récents */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Derniers Inscrits</h2>
                            <div className="flex gap-2">
                                <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-sm">
                                    Total: {students.length}
                                </span>
                                <span className="bg-brand-orange/10 text-brand-orange font-bold px-3 py-1 rounded-full text-sm">
                                    VIP: {vipCount}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                        <th className="pb-3 font-medium">Nom de l'élève</th>
                                        <th className="pb-3 font-medium">Contact / ID</th>
                                        <th className="pb-3 font-medium">Classe</th>
                                        <th className="pb-3 font-medium">Statut</th>
                                        <th className="pb-3 font-medium text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 font-bold text-gray-900">{student.name}</td>
                                            <td className="py-4 text-sm text-gray-500">{student.email}</td>
                                            <td className="py-4 text-sm text-gray-700">{student.grade_level || '-'}</td>
                                            <td className="py-4">
                                                {student.isPremium ? (
                                                    <span className="bg-brand-orange-light text-white text-xs font-bold px-2 py-1 rounded">VIP</span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Gratuit</span>
                                                )}
                                            </td>
                                            <td className="py-4 text-right text-xs text-gray-400">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
