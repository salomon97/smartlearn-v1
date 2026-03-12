import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--primary-dark)] text-white">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 bg-[var(--primary-dark)]/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="SmartLearn Logo"
              width={50}
              height={50}
              className="rounded-full object-cover border border-[var(--primary-gold)]/50"
            />
            <span className="text-2xl font-bold tracking-wider text-white">
              Smart<span className="text-[var(--primary-gold)]">Learn</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/catalogue" className="hover:text-[var(--primary-gold)] transition-colors">Le Catalogue</Link>
            <Link href="/auth/connexion" className="text-white hover:text-white/80 transition-colors">Connexion</Link>
            <Link href="/auth/inscription" className="bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] text-[var(--primary-dark)] px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-[var(--primary-gold)]/20">
              Rejoindre l'Excellence
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl mt-12">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[var(--primary-gold)]/30 bg-[var(--primary-gold)]/10 text-[var(--primary-gold)] text-sm font-semibold tracking-wide">
            🌟 OFFRE EXCEPTIONNELLE - ACCÈS À VIE
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            Maîtrisez votre année <br />
            avec l'élite de <span className="gradient-gold">l'éducation</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Un programme d'excellence de la 6ème à la Terminale. Vidéos haut de gamme, PDF exclusifs et suivi personnalisé pour garantir la réussite aux examens.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/catalogue" className="w-full sm:w-auto px-8 py-4 bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] text-[var(--primary-dark)] rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--primary-gold)]/30 flex items-center justify-center gap-2">
              Découvrir les cours
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/auth/inscription" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[var(--primary-gold)] text-[var(--primary-gold)] hover:bg-[var(--primary-gold)]/10 rounded-full font-bold text-lg transition-all flex items-center justify-center">
              Créer mon compte
            </Link>
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold gradient-gold mb-2">+50</span>
              <span className="text-sm text-gray-400 uppercase tracking-wider">Cours Vidéos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold gradient-gold mb-2">100%</span>
              <span className="text-sm text-gray-400 uppercase tracking-wider">Réussite</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold gradient-gold mb-2">24/7</span>
              <span className="text-sm text-gray-400 uppercase tracking-wider">Accès illimité</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold gradient-gold mb-2">VIP</span>
              <span className="text-sm text-gray-400 uppercase tracking-wider">Support</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
