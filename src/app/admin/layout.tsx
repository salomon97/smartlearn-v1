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
        <div className="flex min-h-screen bg-[var(--background)]">
            {/* Sidebar de l'admin */}
            <AdminNavigation />
            
            {/* Contenu principal */}
            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
