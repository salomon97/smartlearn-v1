import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-gray-100">
                <Link href="/" className="text-brand-orange font-bold flex items-center gap-2 mb-8">
                    ← Retour à l'accueil
                </Link>
                
                <h1 className="text-4xl font-black text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>
                
                <div className="prose prose-slate max-w-none space-y-6 text-gray-600 font-medium">
                    <p>
                        L'accès et l'utilisation du site <strong>SmartLearn</strong> sont soumis aux présentes conditions. En utilisant notre plateforme, vous acceptez ces termes sans réserve.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">1. Objet du service</h2>
                    <p>
                        SmartLearn est une plateforme éducative fournissant des contenus de révision (vidéos, PDF, annales) pour les élèves. L'accès VIP est payant et personnel.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">2. Accès et Sécurité des comptes</h2>
                    <p>
                        L'accès à l'espace VIP est strictement personnel. <strong>Le partage de compte est formellement interdit.</strong> Notre système détecte les connexions simultanées. En cas d'abus (partage manifeste du mot de passe), SmartLearn se réserve le droit de suspendre l'accès sans remboursement.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">3. Propriété intellectuelle</h2>
                    <p>
                        Tous les contenus (vidéos, textes, design) sont la propriété exclusive de SmartLearn. Toute reproduction ou redistribution non autorisée est passible de poursuites.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">4. Modalités de paiement</h2>
                    <p>
                        Les paiements sont effectués via la plateforme sécurisée Chariow. L'accès VIP est activé à vie pour la classe sélectionnée dès validation de la transaction. Aucun abonnement récurrent n'est appliqué.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">5. Responsabilité</h2>
                    <p>
                        SmartLearn s'efforce de fournir une plateforme stable et des contenus de qualité, mais ne saurait être tenu responsable des interruptions de service liées aux fournisseurs de réseau ou d'hébergement.
                    </p>

                    <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <p className="text-sm">
                            <strong>SmartLearn - Éducation pour tous</strong><br />
                            Siège social : Douala, Cameroun<br />
                            Contact : foesalomon65@gmail.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
