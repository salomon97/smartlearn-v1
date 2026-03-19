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
        <div className="container mx-auto text-center max-w-4xl mt-12 mb-20">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[var(--primary-gold)]/30 bg-[var(--primary-gold)]/10 text-[var(--primary-gold)] text-sm font-bold tracking-wide animate-pulse">
            🌟 OFFRE EXCEPTIONNELLE - ACCÈS À VIE
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
            Maîtrisez votre année <br />
            avec l'élite de <span className="gradient-gold">l'APC</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Le programme officiel camerounais réinventé. Mathématiques et Informatique de la 6ème à la Terminale avec l'Approche Par les Compétences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/catalogue" className="w-full sm:w-auto px-10 py-5 bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] text-[var(--primary-dark)] rounded-full font-black text-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--primary-gold)]/40 flex items-center justify-center gap-2">
              Explorer le Catalogue
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Section APC - Approche Par les Compétences */}
        <section className="container mx-auto max-w-6xl mb-32">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-gold)]/10 blur-[100px]"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-6">L'Approche Par les <span className="text-[var(--primary-gold)]">Compétences (APC)</span></h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Fini l'apprentissage par cœur. Nos cours sont structurés pour répondre à des <strong>situations de vie réelles</strong>. Chaque module transforme la théorie en savoir-faire pratique, garantissant non seulement la réussite aux examens mais aussi une maîtrise durable.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Résolution de problèmes",
                    "Raisonnement logique",
                    "Esprit critique",
                    "Autonomie numérique"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-white/80 bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                      <div className="w-2 h-2 bg-[var(--primary-gold)] rounded-full"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gradient-to-br from-[var(--primary-gold)]/20 to-transparent rounded-3xl border border-[var(--primary-gold)]/20 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-3">🎯</span>
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--primary-gold)]">Objectif</span>
                  <span className="text-sm font-bold">100% de réussite</span>
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center transform translate-y-8">
                  <span className="text-4xl mb-3">📚</span>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Programme</span>
                  <span className="text-sm font-bold">Officiel MINESEC</span>
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-3">💻</span>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Tech</span>
                  <span className="text-sm font-bold">Inclusion Numérique</span>
                </div>
                <div className="aspect-square bg-gradient-to-tr from-blue-500/10 to-transparent rounded-3xl border border-blue-500/20 flex flex-col items-center justify-center p-6 text-center transform translate-y-8">
                  <span className="text-4xl mb-3">🌍</span>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400">Méthode</span>
                  <span className="text-sm font-bold">APC Intégrée</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Nos Cycles d'Excellence */}
        <section className="container mx-auto max-w-7xl mb-20 px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Nos Cycles d'Excellence</h2>
            <p className="text-gray-400 font-medium">Un accompagnement sur-mesure de la 6ème à la Terminale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "Premier Cycle", 
                desc: "6ème à 3ème : Le socle commun en Mathshématique & Informatique.", 
                icon: "📘", 
                color: "from-blue-500/20",
                badge: "Classes : 6e, 5e, 4e, 3e"
              },
              { 
                title: "Second Cycle A", 
                desc: "Séries Littéraires : Analyse, Probabilités et Gestion Numérique.", 
                icon: "🖋️", 
                color: "from-purple-500/20",
                badge: "Séries A1, A2, A3, A4"
              },
              { 
                title: "Second Cycle C/D/E", 
                desc: "Séries Scientifiques : Géométrie complexe, Algorithmique & Programmation.", 
                icon: "🔬", 
                color: "from-emerald-500/20",
                badge: "Séries C, D, E"
              },
              { 
                title: "Série Technique TI", 
                desc: "Technologies de l'Info : Programmation, Réseaux et Mathématiques TI.", 
                icon: "🚀", 
                color: "from-[var(--primary-gold)]/20",
                badge: "Classes : 1ère TI, Tle TI"
              }
            ].map((cycle, i) => (
              <div key={i} className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all hover:-translate-y-2 duration-500 flex flex-col items-center text-center">
                <div className={`absolute inset-0 bg-gradient-to-br ${cycle.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]`}></div>
                <div className="text-6xl mb-6 relative z-10">{cycle.icon}</div>
                <h3 className="text-2xl font-black mb-3 relative z-10">{cycle.title}</h3>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 mb-4 relative z-10 border border-white/5">
                  {cycle.badge}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 relative z-10 px-2">{cycle.desc}</p>
                <Link href="/catalogue" className="mt-auto inline-flex items-center gap-2 text-[var(--primary-gold)] font-black text-sm uppercase tracking-widest hover:gap-3 transition-all relative z-10">
                  Voir les cours →
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
             <div className="inline-flex flex-col md:flex-row items-center gap-10 bg-white/5 backdrop-blur-md px-10 py-8 rounded-full border border-white/10">
                <div className="flex flex-col">
                  <span className="text-4xl font-black gradient-gold">+50</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cours Vidéos</span>
                </div>
                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black gradient-gold">100%</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Réussite</span>
                </div>
                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black gradient-gold">APC</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approche Intégrée</span>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
