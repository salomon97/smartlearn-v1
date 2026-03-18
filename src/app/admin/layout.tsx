import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminNavigation from "./components/AdminNavigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Mobile Rapide */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-[60] shadow-md">
                <div className="font-black text-brand-orange text-lg">SmartLearn <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded ml-1">ADMIN</span></div>
                {/* Le bouton menu sera géré par le composant navigation en interne ou ici */}
            </div>

            <div className="flex">
                {/* Sidebar de l'admin */}
                <AdminNavigation />
                
                {/* Contenu principal */}
                <main className="flex-1 p-4 md:p-8 md:ml-64 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
