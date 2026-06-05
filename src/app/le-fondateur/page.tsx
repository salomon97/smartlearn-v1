import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserNav from "@/components/UserNav";
import { Logo } from "@/components/ui/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le fondateur — Salomon FOE",
  description: "Salomon FOE, enseignant de Mathématiques et d'Informatique au Cameroun, fondateur et Directeur Pédagogique de SmartLearn.",
};

export default async function FounderPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 bg-navy/85 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" aria-label="SmartLearn — Accueil" className="transition-opacity hover:opacity-90">
            <Logo variant="compact" theme="dark" size={36} />
          </Link>
          <UserNav session={session} />
        </div>
      </header>

      <main className="pt-32 pb-24 px-6">

        {/* ─── Hero portrait ─── */}
        <section className="container mx-auto max-w-5xl mb-24">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16 items-center">

            {/* Portrait */}
            <div className="md:col-span-2 flex justify-center md:justify-start">
              <div className="relative">
                {/* Halo */}
                <div className="absolute -inset-6 bg-gradient-to-br from-teal/30 to-orange/20 blur-2xl rounded-full"></div>
                {/* Photo — cadre généreux, crop centré sur la tête (top de la photo) */}
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-navy-deep">
                  <Image
                    src="/founder-portrait.png"
                    alt="Salomon FOE, fondateur de SmartLearn"
                    fill
                    sizes="(max-width: 768px) 18rem, 24rem"
                    className="object-cover object-[55%_15%]"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bloc intro */}
            <div className="md:col-span-3 text-center md:text-left">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
                Le fondateur
              </span>
              <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight mb-4">
                Salomon FOE
              </h1>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                Enseignant de Mathématiques et d'Informatique au Cameroun.<br />
                Fondateur &amp; Directeur Pédagogique de <span className="text-teal font-semibold">SmartLearn</span>.
              </p>

              {/* Coordonnées rapides */}
              <div className="inline-flex flex-col md:flex-row gap-3 md:gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span aria-hidden>📍</span>
                  <span>Douala, Cameroun</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span aria-hidden>✉️</span>
                  <a
                    href="mailto:salomonfoe97@smartlearn-edu.org"
                    className="hover:text-teal transition-colors"
                  >
                    salomonfoe97@smartlearn-edu.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Récit ─── */}
        <section className="container mx-auto max-w-3xl mb-24">
          <div className="prose prose-invert max-w-none space-y-6 text-slate-300 leading-relaxed">

            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mt-0 mb-6">
              Pourquoi j'ai construit SmartLearn.
            </h2>

            <p className="text-lg">
              J'ai grandi au Cameroun, où la qualité de l'éducation dépend trop souvent du quartier où l'on est né
              et des moyens des parents. En tant qu'enseignant de Mathématiques et d'Informatique, j'ai vu des
              élèves brillants se retrouver bloqués au BEPC, au Probatoire ou au BAC — non pas par manque de
              talent, mais par manque d'outils pédagogiques structurés.
            </p>

            <p>
              SmartLearn est né de cette frustration. Une plateforme conçue pour que <strong className="text-white">
              chaque élève camerounais</strong>, peu importe son lycée, son village ou son budget, ait accès à
              des cours structurés selon l'<span className="text-teal">Approche Par les Compétences (APC)</span>
              et à des annales corrigées qui préparent vraiment aux examens officiels.
            </p>

            <h3 className="font-heading text-xl font-bold text-white mt-10 mb-4">
              Ma méthode.
            </h3>
            <p>
              Pas de cours récités par cœur. Chaque module SmartLearn transforme la théorie en situation de vie
              réelle, conformément aux exigences du programme officiel du MINESEC. L'élève ne mémorise plus —
              il <strong className="text-white">comprend, applique et réussit</strong>.
            </p>

            <h3 className="font-heading text-xl font-bold text-white mt-10 mb-4">
              Mon engagement.
            </h3>
            <p>
              Je tiens à ce que SmartLearn reste accessible. Notre tarif d'abonnement est calibré pour rester
              abordable pour la majorité des familles camerounaises, avec trois formules (mensuel, trimestriel,
              annuel) au choix. Et pour les établissements partenaires, nous redistribuons 25 % des frais
              d'inscription des élèves sous forme de soutien aux projets de l'école.
            </p>

            <p className="text-slate-400 italic border-l-4 border-teal pl-5 my-10">
              « Mon ambition n'est pas de remplacer l'école. C'est de la prolonger jusqu'à la maison de
              chaque enfant. »
            </p>
          </div>
        </section>

        {/* ─── Coordonnées détaillées ─── */}
        <section className="container mx-auto max-w-3xl mb-20">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
            <h2 className="font-heading text-2xl font-bold mb-6">Me contacter directement</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">Email professionnel</dt>
                <dd>
                  <a
                    href="mailto:salomonfoe97@smartlearn-edu.org"
                    className="text-white hover:text-teal transition-colors break-all"
                  >
                    salomonfoe97@smartlearn-edu.org
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">Téléphones (WhatsApp possible)</dt>
                <dd className="text-white space-y-1">
                  <div>
                    <a href="tel:+237671719124" className="hover:text-teal transition-colors">
                      +237 671 71 91 24
                    </a>
                  </div>
                  <div>
                    <a href="tel:+237691276334" className="hover:text-teal transition-colors">
                      +237 691 27 63 34
                    </a>
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">Siège</dt>
                <dd className="text-white">Douala, Cameroun</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">Pour les établissements</dt>
                <dd>
                  <a
                    href="mailto:salomonfoe97@smartlearn-edu.org?subject=Partenariat%20%C3%A9tablissement"
                    className="text-white hover:text-teal transition-colors"
                  >
                    Demander un partenariat
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ─── CTA final ─── */}
        <section className="container mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Donnez à votre enfant la place qu'il mérite.
          </h2>
          <p className="text-slate-400 mb-8">
            Trois formules, tous les niveaux, partout au Cameroun.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/inscription"
              className="w-full sm:w-auto px-8 py-4 bg-orange hover:bg-orange/90 text-white rounded-full font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/30"
            >
              Créer un compte
            </Link>
            <Link
              href="/paiement"
              className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-teal/60 hover:bg-teal/5 text-white rounded-full font-semibold transition-all"
            >
              Voir les tarifs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
