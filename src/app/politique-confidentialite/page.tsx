import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment SmartLearn collecte, utilise et protège vos données personnelles. Conforme à la législation camerounaise et aux bonnes pratiques internationales (RGPD-aligned).",
};

export default function PrivacyPolicyPage() {
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

        {/* Titre */}
        <div className="mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
            Institutionnel
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-navy leading-tight mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-slate-500 text-sm">
            Version en vigueur depuis le 3 juin 2026
          </p>
        </div>

        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">

          <p className="text-slate-700 leading-relaxed mb-10">
            Chez <strong className="text-navy">SmartLearn</strong>, la protection de vos données personnelles est une priorité.
            Cette politique vous explique précisément quelles informations nous collectons, pourquoi, comment nous
            les utilisons, et quels droits vous avez sur ces données. Elle s&apos;applique à toute personne qui utilise
            la plateforme SmartLearn — élève, parent, ambassadeur ou visiteur.
          </p>

          <Section title="1. Identité du responsable de traitement">
            <p>
              Le responsable du traitement de vos données est <strong>SmartLearn</strong>, opérée par
              <strong> Salomon FOE</strong>, fondateur et Directeur Pédagogique.
            </p>
            <ContactCard />
          </Section>

          <Section title="2. Données que nous collectons">
            <p>Nous distinguons trois catégories :</p>

            <h3 className="font-heading text-base font-semibold text-navy mt-6 mb-2">a. Données fournies à l&apos;inscription</h3>
            <BulletList items={[
              "Nom complet",
              "Adresse e-mail",
              "Numéro de téléphone (pour les notifications et le support)",
              "Mot de passe (stocké sous forme chiffrée, jamais en clair)",
              "Classe / filière (pour les élèves)",
              "Code parrain (si l'inscription provient d'un lien d'affiliation)",
            ]} />

            <h3 className="font-heading text-base font-semibold text-navy mt-6 mb-2">b. Données générées par l&apos;utilisation</h3>
            <BulletList items={[
              "Adresse IP (sécurité des sessions, lutte contre la fraude d'affiliation)",
              "Date et heure de connexion",
              "Pages et contenus consultés (suivi pédagogique)",
              "Progression dans les cours (pour le suivi parent et le moteur de rétention)",
              "Préférences d'affichage",
            ]} />

            <h3 className="font-heading text-base font-semibold text-navy mt-6 mb-2">c. Données de paiement</h3>
            <p>
              Les paiements sont traités par notre partenaire <strong>Chariow</strong>.
              SmartLearn <strong>ne stocke aucune donnée bancaire</strong> sur ses serveurs.
              Nous recevons uniquement un identifiant de transaction et le statut du paiement.
            </p>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données ne sont utilisées que pour les finalités suivantes :</p>
            <BulletList items={[
              "Vous fournir l'accès aux contenus pédagogiques (Premium ou gratuits)",
              "Personnaliser votre expérience d'apprentissage et envoyer des rappels pédagogiques",
              "Sécuriser votre compte (détection de connexions simultanées suspectes, sessions actives)",
              "Traiter vos paiements via Chariow et activer votre abonnement",
              "Verser les commissions du programme Ambassadeur et prévenir la fraude d'auto-affiliation",
              "Vous notifier par e-mail ou SMS lors d'événements importants (vérification, expiration d'abonnement, retrait validé)",
              "Améliorer la plateforme grâce à des statistiques d'usage agrégées et anonymisées",
            ]} />
          </Section>

          <Section title="4. Programme Ambassadeur — données spécifiques">
            <p>
              Si vous êtes ambassadeur affilié, nous collectons en plus :
            </p>
            <BulletList items={[
              "Votre code d'affiliation unique",
              "Le numéro Mobile Money utilisé pour les retraits",
              "L'historique de vos parrainages, conversions et commissions",
              "L'historique de vos demandes de retrait",
            ]} />
            <p className="mt-4">
              Pour prévenir la fraude (auto-affiliation), nous comparons les adresses IP et e-mails entre parrain et
              filleul. Aucune sanction n&apos;est appliquée sans vérification humaine.
            </p>
          </Section>

          <Section title="5. Durée de conservation">
            <BulletList items={[
              "Compte actif : tant que votre compte existe",
              "Données de progression : pendant toute la durée de votre abonnement, puis 12 mois après expiration",
              "Données de paiement (référence transaction) : 10 ans (obligation comptable)",
              "Logs de sécurité : 12 mois maximum",
              "Données du programme Ambassadeur : 5 ans après la dernière transaction",
            ]} />
          </Section>

          <Section title="6. Partage des données">
            <p>
              SmartLearn <strong>ne vend, ne loue, ni ne partage</strong> vos données personnelles à des tiers à des
              fins marketing. Vos données ne sont transmises qu&apos;aux partenaires techniques strictement nécessaires
              au fonctionnement du service :
            </p>
            <BulletList items={[
              "Chariow (traitement des paiements)",
              "MongoDB Atlas (hébergement de la base de données)",
              "Bunny.net (diffusion des vidéos de cours)",
              "Notre fournisseur SMTP (envoi des e-mails transactionnels)",
            ]} />
          </Section>

          <Section title="7. Sécurité">
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
            </p>
            <BulletList items={[
              "Chiffrement TLS / HTTPS sur toutes les communications",
              "Mots de passe stockés avec bcrypt (algorithme de hachage cryptographique)",
              "Sessions JWT signées avec rotation régulière du secret",
              "Vérification HMAC des webhooks de paiement",
              "Surveillance des connexions simultanées suspectes",
              "Sauvegardes régulières et chiffrées de la base de données",
            ]} />
          </Section>

          <Section title="8. Vos droits">
            <p>Conformément à la législation applicable, vous disposez à tout moment des droits suivants :</p>
            <BulletList items={[
              "Droit d'accès : obtenir une copie de vos données",
              "Droit de rectification : corriger des informations inexactes",
              "Droit à l'effacement : demander la suppression de votre compte et de vos données",
              "Droit à la portabilité : recevoir vos données dans un format structuré",
              "Droit d'opposition : refuser l'utilisation de vos données pour certaines finalités",
              "Droit de retirer votre consentement à tout moment",
            ]} />
            <p className="mt-4">
              Pour exercer l&apos;un de ces droits, contactez le délégué à la protection des données par e-mail.
              Nous nous engageons à répondre sous <strong>30 jours</strong>.
            </p>
          </Section>

          <Section title="9. Cookies">
            <p>
              SmartLearn utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement
              du service : authentification, session, préférences d&apos;affichage. Aucun cookie publicitaire ni
              traceur tiers à des fins marketing n&apos;est utilisé.
            </p>
          </Section>

          <Section title="10. Mineurs">
            <p>
              SmartLearn s&apos;adresse à des élèves du secondaire, dont certains peuvent être mineurs. Nous
              recommandons l&apos;accompagnement d&apos;un parent ou tuteur légal lors de l&apos;inscription. Les parents
              peuvent demander à tout moment l&apos;accès, la modification ou la suppression du compte de leur enfant.
            </p>
          </Section>

          <Section title="11. Modifications de cette politique">
            <p>
              Cette politique peut évoluer. Toute modification substantielle vous sera notifiée par e-mail au moins
              <strong> 15 jours</strong> avant son entrée en vigueur. La date de dernière mise à jour figure en
              haut de cette page.
            </p>
          </Section>

          <Section title="12. Contact" last>
            <p>
              Pour toute question relative à la protection de vos données :
            </p>
            <ContactCard />
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

function ContactCard() {
  return (
    <div className="mt-4 p-5 bg-teal/5 border border-teal/15 rounded-2xl text-sm space-y-1.5">
      <p className="font-semibold text-navy mb-2">Délégué à la protection des données</p>
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
  );
}
