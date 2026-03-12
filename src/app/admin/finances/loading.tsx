export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="relative w-16 h-16">
                {/* Anneau extérieur gris */}
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                {/* Anneau intérieur orange qui tourne */}
                <div className="absolute inset-0 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Chargement des Finances</h3>
                <p className="text-sm text-gray-500">Calcul des statistiques en cours...</p>
            </div>
        </div>
    );
}
