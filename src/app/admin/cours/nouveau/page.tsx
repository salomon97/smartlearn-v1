import Link from "next/link";
import { ArrowLeft, BookPlus } from "lucide-react";
import CourseForm from "./components/CourseForm";

export default function NewCoursePage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Bouton Retour */}
            <div>
                <Link 
                    href="/admin/cours" 
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-orange font-bold text-sm transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour aux formations
                </Link>
            </div>

            {/* En-tête de la page */}
            <div>
                <div className="inline-flex items-center justify-center p-3 bg-brand-orange/10 rounded-2xl mb-4">
                    <BookPlus className="w-6 h-6 text-brand-orange" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    Nouvelle Formation
                </h1>
                <p className="text-gray-500 max-w-2xl">
                    Créez la fiche de votre nouveau cours ici. Une fois créée, vous pourrez y ajouter tous vos chapitres, vidéos YouTube et supports PDF.
                </p>
            </div>

            {/* Le Formulaire Interactif */}
            <div className="max-w-4xl">
                <CourseForm />
            </div>
        </div>
    );
}
