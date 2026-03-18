import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-gray-100">
                <Link href="/" className="text-brand-orange font-bold flex items-center gap-2 mb-8">
                    ← Retour à l'accueil
                </Link>
                
                <h1 className="text-4xl font-black text-gray-900 mb-8">Politique de Confidentialité</h1>
                
                <div className="prose prose-slate max-w-none space-y-6 text-gray-600 font-medium">
                    <p>
                        Chez <strong>SmartLearn</strong>, nous accordons une importance capitale à la protection de vos données personnelles. Cette politique détaille comment nous collectons et utilisons vos informations.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">1. Collecte des données</h2>
                    <p>
                        Nous collectons les informations suivantes lors de votre inscription ou de votre utilisation du site :
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Nom et prénom</li>
                            <li>Adresse e-mail</li>
                            <li>Filière d'étude</li>
                            <li>Adresse IP (pour la sécurité des sessions et la lutte contre la fraude)</li>
                        </ul>
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">2. Utilisation des données</h2>
                    <p>
                        Vos données sont utilisées exclusivement pour :
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Vous fournir l'accès aux contenus éducatifs (VIP)</li>
                            <li>Personnaliser votre expérience d'apprentissage</li>
                            <li>Assurer la sécurité de votre compte (détection de connexions simultanées)</li>
                            <li>Traiter vos paiements via notre partenaire sécurisé Chariow</li>
                        </ul>
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">3. Partage des données</h2>
                    <p>
                        SmartLearn ne vend, ne loue, ni ne partage vos données personnelles avec des tiers à des fins marketing. Vos informations de paiement sont traitées directement par Chariow et ne sont jamais stockées sur nos serveurs.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">4. Sécurité</h2>
                    <p>
                        Nous utilisons des protocoles de sécurité avancés (chiffrement SSL, surveillance des sessions) pour protéger vos informations contre tout accès non autorisé.
                    </p>

                    <h2 className="text-xl font-bold text-gray-800 mt-8">5. Vos droits</h2>
                    <p>
                        Conformément aux lois en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ce droit depuis votre profil utilisateur.
                    </p>

                    <div className="mt-12 p-6 bg-brand-orange/5 rounded-2xl border border-brand-orange/10">
                        <p className="text-sm font-bold text-brand-orange">
                            Dernière mise à jour : 18 Mars 2026<br />
                            Contact : contact@smartlearn-edu.org
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
