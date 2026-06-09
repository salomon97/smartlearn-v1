import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Les conditions générales d'utilisation de la plateforme SmartLearn : compte, abonnement, paiement, programme ambassadeur, propriété intellectuelle.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-navy text-white py-5 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" aria-label="SmartLearn — Accueil">
            <Logo variant="compact" theme="dark" size={32} />
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-teal transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 md:py-20 px-6">

        <div className="mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
            Institutionnel
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-navy leading-tight mb-3">
            Conditions générales d&apos;utilisation
          </h1>
          <p className="text-slate-500 text-sm">
            Version en vigueur depuis le 3 juin 2026
          </p>
        </div>

        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">

          <p className="text-slate-700 leading-relaxed mb-10">
            Les présentes conditions générales d&apos;utilisation (« CGU ») régissent l&apos;accès et l&apos;utilisation de
            la plateforme <strong className="text-navy">SmartLearn</strong>, opérée par Salomon FOE depuis Douala,
            Cameroun. En créant un compte ou en utilisant le service, vous acceptez sans réserve l&apos;ensemble des
            clauses ci-dessous.
          </p>

          <Section title="1. Objet du service">
            <p>
              SmartLearn est une <strong>plateforme numérique d&apos;excellence pédagogique</strong> dédiée à la
              réussite scolaire des élèves du secondaire au Cameroun. Elle propose :
            </p>
            <BulletList items={[
              "Des cours structurés en Mathématiques et Informatique selon l'Approche Par Compétences (APC)",
              "Des exercices corrigés progressifs et des annales d'examens officiels (BEPC, Probatoire, BAC)",
              "Un suivi de progression personnalisé accessible à l'élève et à ses parents",
              "Un programme Ambassadeur permettant de générer des revenus par parrainage",
            ]} />
            <p>
              La plateforme couvre le programme officiel du MINESEC pour la classe de 3<sup>e</sup> et les Séries A, C, D, E
              et TI.
            </p>
          </Section>

          <Section title="2. Création de compte">
            <p>
              L&apos;inscription est gratuite et accessible à toute personne disposant d&apos;une adresse e-mail valide
              et d&apos;un numéro de téléphone joignable. La création de compte requiert la fourniture d&apos;informations
              exactes : nom complet, e-mail, téléphone, classe (pour les élèves).
            </p>
            <p>
              L&apos;utilisateur s&apos;engage à <strong>maintenir ses identifiants confidentiels</strong> et à informer
              SmartLearn sans délai en cas d&apos;utilisation non autorisée de son compte.
            </p>
            <p>
              Les mineurs sont invités à s&apos;inscrire avec l&apos;accord d&apos;un parent ou tuteur légal.
            </p>
          </Section>

          <Section title="3. Accès Premium et abonnements">
            <p>
              L&apos;accès aux contenus pédagogiques complets est conditionné à la souscription d&apos;un abonnement
              Premium. SmartLearn propose trois formules :
            </p>
            <BulletList items={[
              "Formule mensuelle : 2 500 FCFA / mois",
              "Formule trimestrielle : 5 000 FCFA / trimestre (économie de 33 %)",
              "Formule annuelle : 10 000 FCFA / an (économie de 67 %, meilleur rapport)",
            ]} />
            <p>
              L&apos;accès est <strong>strictement personnel et non transférable</strong>. Le partage de compte est
              formellement interdit. SmartLearn détecte les connexions simultanées suspectes ; en cas d&apos;abus
              caractérisé, l&apos;accès peut être suspendu sans remboursement.
            </p>
            <p>
              <strong>Aucun prélèvement automatique</strong> n&apos;est appliqué. Le renouvellement de l&apos;abonnement
              est à l&apos;initiative de l&apos;utilisateur.
            </p>
          </Section>

          <Section title="4. Modalités de paiement">
            <p>
              Les paiements sont opérés via la plateforme sécurisée <strong>Chariow</strong>. Sont acceptés :
              MTN Mobile Money, Orange Money, Visa et Mastercard.
            </p>
            <p>
              SmartLearn <strong>ne stocke aucune donnée bancaire</strong>. L&apos;ensemble du processus de paiement
              est délégué à Chariow, conformément à sa propre politique de sécurité.
            </p>
            <p>
              L&apos;activation de l&apos;accès Premium est effective dès confirmation du paiement par Chariow,
              généralement en quelques secondes. En cas de retard, le compte est automatiquement activé à réception
              du webhook de confirmation.
            </p>
          </Section>

          <Section title="5. Politique de remboursement">
            <p>
              Conformément à l&apos;article du Code de la consommation applicable aux services numériques activés
              immédiatement, <strong>les abonnements Premium ne sont pas remboursables</strong> après activation,
              sauf dispositions légales contraires.
            </p>
            <p>
              En cas de dysfonctionnement technique majeur empêchant l&apos;accès au service, SmartLearn s&apos;engage
              à étendre la durée de l&apos;abonnement de la période d&apos;indisponibilité, ou à proposer une solution
              équitable au cas par cas.
            </p>
          </Section>

          <Section title="6. Programme Ambassadeur">
            <p>
              SmartLearn propose un programme d&apos;affiliation rémunéré permettant aux utilisateurs de générer des
              revenus en parrainant de nouveaux abonnés. Les règles principales :
            </p>
            <BulletList items={[
              "Commission de 10 % sur la souscription Premium de chaque filleul (taux par défaut, modifiable par l'administrateur)",
              "Période de garantie de 72 heures : la commission devient disponible 3 jours après la transaction",
              "Seuil minimum de retrait : 2 000 FCFA",
              "Retraits opérés manuellement via Mobile Money sur le numéro fourni par l'ambassadeur",
              "Auto-affiliation interdite : un utilisateur ne peut pas se parrainer lui-même (détection automatique par IP et e-mail)",
            ]} />
            <p>
              Toute tentative de fraude (faux comptes, manipulation d&apos;adresses IP, achats fictifs) entraîne
              l&apos;annulation des commissions et la suspension du compte ambassadeur.
            </p>
          </Section>

          <Section title="7. Propriété intellectuelle">
            <p>
              L&apos;ensemble des contenus présents sur la plateforme — vidéos, textes, exercices, annales corrigées,
              design, code source, marque « SmartLearn » et identité visuelle associée — est la
              <strong> propriété exclusive de SmartLearn et de son fondateur Salomon FOE</strong>.
            </p>
            <p>
              Toute reproduction, redistribution, captation, partage public ou exploitation commerciale non
              autorisée est strictement interdite et passible de poursuites au titre du droit camerounais et des
              conventions internationales applicables.
            </p>
          </Section>

          <Section title="8. Responsabilité">
            <p>
              SmartLearn s&apos;engage à mettre en œuvre les moyens techniques nécessaires pour assurer la
              disponibilité et la qualité de la plateforme. Toutefois, SmartLearn ne saurait être tenu responsable :
            </p>
            <BulletList items={[
              "Des interruptions de service liées à des facteurs externes (réseau, hébergeur, fournisseur de paiement)",
              "Des conséquences d'une mauvaise utilisation du service par l'utilisateur",
              "De l'échec scolaire d'un élève : la plateforme est un outil, pas une garantie de réussite",
              "Des actes de tiers (piratage, usurpation d'identité) en l'absence de faute prouvée de SmartLearn",
            ]} />
          </Section>

          <Section title="9. Modification et résiliation">
            <p>
              SmartLearn se réserve le droit de modifier les présentes CGU à tout moment. Toute modification
              substantielle sera notifiée par e-mail au moins <strong>15 jours</strong> avant son entrée en
              vigueur. La poursuite de l&apos;utilisation du service après cette date vaut acceptation des nouvelles
              conditions.
            </p>
            <p>
              L&apos;utilisateur peut résilier son compte à tout moment depuis son profil ou en contactant le support.
              SmartLearn peut également résilier un compte en cas de manquement grave aux présentes CGU.
            </p>
          </Section>

          <Section title="10. Droit applicable et juridiction">
            <p>
              Les présentes CGU sont régies par le droit camerounais. Tout litige relatif à leur interprétation ou
              à leur exécution sera, à défaut de règlement amiable, soumis à la juridiction compétente de Douala.
            </p>
          </Section>

          <Section title="11. Contact" last>
            <p>
              Pour toute question relative aux présentes conditions ou au fonctionnement du service :
            </p>
            <div className="mt-4 p-5 bg-teal/5 border border-teal/15 rounded-2xl text-sm space-y-1.5">
              <p className="font-semibold text-navy mb-2">SmartLearn — L&apos;école qui suit votre enfant.</p>
              <p>Salomon FOE — Fondateur &amp; Directeur Pédagogique</p>
              <p>
                Email : <a href="mailto:salomonfoe97@smartlearn-edu.org" className="text-teal hover:text-teal-dark transition-colors break-all">salomonfoe97@smartlearn-edu.org</a>
              </p>
              <p>
                Téléphones :{" "}
                <a href="tel:+237671719124" className="text-teal hover:text-teal-dark transition-colors">+237 671 71 91 24</a>
                {" / "}
                <a href="tel:+237691276334" className="text-teal hover:text-teal-dark transition-colors">+237 691 27 63 34</a>
              </p>
              <p>Siège : Douala, Cameroun</p>
            </div>
          </Section>
        </article>
      </main>
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={last ? "" : "border-b border-slate-100 pb-8 mb-8"}>
      <h2 className="font-heading text-xl md:text-2xl font-bold text-navy mt-2 mb-4">{title}</h2>
      <div className="text-slate-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-2 mt-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
