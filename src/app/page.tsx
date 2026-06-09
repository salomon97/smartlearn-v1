import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserNav from "@/components/UserNav";
import { Logo } from "@/components/ui/Logo";
import { programs } from "@/data/curriculum";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* ──────────────────────── NAVBAR ──────────────────────── */}
      <header className="fixed w-full top-0 z-50 bg-navy/85 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" aria-label="SmartLearn — Accueil" className="transition-opacity hover:opacity-90">
            <Logo variant="compact" theme="dark" size={36} />
          </Link>
          <UserNav session={session} />
        </div>
      </header>

      {/* ──────────────────────── HERO ──────────────────────── */}
      <main className="pt-32 pb-20 px-6">
        <section className="container mx-auto max-w-5xl text-center pt-12 pb-24">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-teal/30 bg-teal/10 text-teal text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span>
            Cameroun · Programme officiel MINESEC
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            De la 6<sup>e</sup> à la Terminale,{" "}
            <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
              le programme MINESEC depuis chez soi.
            </span>
          </h1>

          {/* Signature tagline */}
          <p className="text-teal/80 text-sm md:text-base font-semibold tracking-[0.2em] uppercase mb-10">
            Connecter <span className="text-teal mx-1">·</span> Suivre{" "}
            <span className="text-teal mx-1">·</span> Réussir
          </p>

          {/* Sub */}
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            La plateforme numérique d'excellence pédagogique pour le secondaire camerounais.
            Mathématiques et Informatique selon l'<strong className="text-white">Approche Par Compétences</strong>,
            de la 6ème à la Terminale.
          </p>

          {/* CTAs : orange primaire + ghost teal secondaire (1 seul CTA primaire par écran) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/inscription"
              className="w-full sm:w-auto px-8 py-4 bg-orange hover:bg-orange/90 text-white rounded-full font-semibold text-base transition-all transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/30 inline-flex items-center justify-center gap-2"
            >
              Créer un compte gratuit
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/paiement"
              className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-teal/60 hover:bg-teal/5 text-white rounded-full font-semibold text-base transition-all"
            >
              Voir les tarifs
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-10 text-xs text-slate-500 tracking-wide">
            Aucune carte bancaire requise pour s'inscrire · Paiement via Mobile Money &amp; Orange Money
          </p>
        </section>

        {/* ──────────────────────── SECTION APC ──────────────────────── */}
        <section className="container mx-auto max-w-6xl mb-32">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 blur-[100px]"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-4">
                  Méthode pédagogique
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  L'<span className="text-teal">Approche Par Compétences</span>, vraiment appliquée.
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                  Fini l'apprentissage par cœur. Nos cours transforment chaque notion en situation de vie
                  réelle. Votre enfant ne récite plus — il <strong className="text-white">comprend, applique, et réussit</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Résolution de problèmes",
                    "Raisonnement logique",
                    "Esprit critique",
                    "Autonomie numérique",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-medium text-white/90 bg-white/5 px-4 py-3 rounded-2xl border border-white/5"
                    >
                      <div className="w-1.5 h-1.5 bg-teal rounded-full flex-shrink-0"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrés stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gradient-to-br from-teal/20 to-transparent rounded-3xl border border-teal/20 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-3">🎯</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">Objectif</span>
                  <span className="text-sm font-semibold">Réussir les examens</span>
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center transform translate-y-8">
                  <span className="text-4xl mb-3">📚</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Programme</span>
                  <span className="text-sm font-semibold">Officiel MINESEC</span>
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-3">📱</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Accès</span>
                  <span className="text-sm font-semibold">Tout Android</span>
                </div>
                <div className="aspect-square bg-gradient-to-tr from-orange/20 to-transparent rounded-3xl border border-orange/20 flex flex-col items-center justify-center p-6 text-center transform translate-y-8">
                  <span className="text-4xl mb-3">🌍</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-orange mb-1">Mission</span>
                  <span className="text-sm font-semibold">Excellence pour tous</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────── SECTION PROGRAMMES (CATALOGUE TEASER) ──────────────────────── */}
        <section className="container mx-auto max-w-7xl mb-32 px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
              Couverture pédagogique
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Le programme officiel à portée de clic
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Mathématiques et Informatique selon l'Approche Par Compétences, par cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.slice(0, 6).map((program) => {
              const isInfo = program.category.includes('Info');
              return (
                <Link
                  key={program.id}
                  href="/catalogue"
                  className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:border-teal/30 transition-all hover:-translate-y-1 duration-300 flex flex-col"
                >
                  {/* Hero icon avec dégradé teal (Info) ou orange (Maths) */}
                  <div className={`h-32 ${isInfo ? 'bg-gradient-to-br from-teal/30 to-teal/5' : 'bg-gradient-to-br from-orange/30 to-orange/5'} relative flex items-center justify-center`}>
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                      {program.icon}
                    </span>
                    <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                        {program.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-teal mb-2">
                      {program.cycle}
                    </span>
                    <h3 className="font-heading text-xl font-bold mb-3 leading-tight group-hover:text-teal transition-colors">
                      {program.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {program.gradeLevels.map((g) => (
                        <span key={g} className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2 py-1 rounded-full text-white/70">
                          {g}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-grow">
                      {program.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-teal font-semibold text-sm group-hover:gap-3 transition-all">
                      Découvrir →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-8 py-4 border border-teal/40 hover:border-teal hover:bg-teal/5 text-white rounded-full font-semibold text-sm transition-all"
            >
              Voir tout le catalogue
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ──────────────────────── SECTION POUR QUI ──────────────────────── */}
        <section className="container mx-auto max-w-6xl mb-32 px-4">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
              Pour qui
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Un outil fédérateur, pas une app de plus.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              SmartLearn connecte les trois acteurs de la réussite scolaire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Élève",
                title: "Apprendre, à son rythme.",
                desc: "Cours vidéo, exercices corrigés, annales — accessibles depuis n'importe quel téléphone Android.",
                icon: "🎓",
              },
              {
                role: "Parent",
                title: "Suivre, sans hurler.",
                desc: "Tableau de bord clair, alertes de progression, garantie d'un encadrement pédagogique sérieux.",
                icon: "👨‍👩‍👧",
              },
              {
                role: "Établissement",
                title: "Renforcer, sans déléguer.",
                desc: "Une plateforme partenaire avec redistribution de 25% sur les inscriptions de vos élèves.",
                icon: "🏫",
              },
            ].map((aud) => (
              <div
                key={aud.role}
                className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:border-teal/30 transition-colors"
              >
                <div className="text-4xl mb-4">{aud.icon}</div>
                <span className="text-xs font-semibold uppercase tracking-widest text-teal mb-2 block">
                  {aud.role}
                </span>
                <h3 className="font-heading text-xl font-bold mb-3">{aud.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{aud.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────── SECTION FONDATEUR (TEASER) ──────────────────────── */}
        <section className="container mx-auto max-w-5xl mb-32 px-4">
          <div className="bg-gradient-to-br from-teal/10 to-orange/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-teal/10 blur-[120px] rounded-full"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
                  Derrière la plateforme
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  Salomon FOE,<br />
                  <span className="text-teal">enseignant avant tout.</span>
                </h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                  Professeur de Mathématiques et d'Informatique au Cameroun, j'ai construit SmartLearn pour
                  donner à chaque élève — y compris ceux qui n'ont pas accès aux meilleurs cours en présentiel —
                  les moyens de réussir le BEPC, le Probatoire et le BAC.
                </p>
                <Link
                  href="/le-fondateur"
                  className="inline-flex items-center gap-2 text-teal font-semibold text-sm hover:gap-3 transition-all"
                >
                  Découvrir mon parcours →
                </Link>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                  <Image
                    src="/founder-portrait.png"
                    alt="Salomon FOE, fondateur de SmartLearn"
                    fill
                    sizes="18rem"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────── CTA FINAL ──────────────────────── */}
        <section className="container mx-auto max-w-4xl px-4">
          <div className="text-center bg-white/5 border border-white/10 rounded-[2.5rem] p-10 md:p-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Prêt à transformer<br />
              <span className="text-teal">l'année scolaire ?</span>
            </h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto">
              Créez un compte gratuit, explorez le catalogue, et choisissez la formule qui correspond à votre
              budget et à vos objectifs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/inscription"
                className="w-full sm:w-auto px-8 py-4 bg-orange hover:bg-orange/90 text-white rounded-full font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/30"
              >
                Commencer maintenant
              </Link>
              <Link
                href="/catalogue"
                className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-teal/60 hover:bg-teal/5 text-white rounded-full font-semibold transition-all"
              >
                Parcourir le catalogue
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
