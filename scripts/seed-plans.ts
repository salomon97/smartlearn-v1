import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../src/models/Plan';

dotenv.config({ path: '.env.local' });

// Les 3 nouvelles grilles tarifaires (mois/trimestre/an) + archivage de l'ancien "vip_avie".
// IMPORTANT : remplacer les chariowUrl par les vraies URLs des 3 produits créés côté Chariow
// AVANT de lancer ce seed en production. Tant que les URLs sont à 'CHANGEME', le webhook
// continuera de résoudre le plan correctement (Plan.findOne par code), mais les boutons
// sur /paiement enverront l'utilisateur sur une page Chariow inexistante.
const PLANS = [
    {
        code: 'vip_monthly',
        name: 'Mensuel',
        price: 2500,
        period: 'monthly' as const,
        durationDays: 30,
        chariowUrl: 'CHANGEME_MONTHLY_CHARIOW_URL',
    },
    {
        code: 'vip_quarterly',
        name: 'Trimestriel',
        price: 5000,
        period: 'quarterly' as const,
        durationDays: 90,
        chariowUrl: 'CHANGEME_QUARTERLY_CHARIOW_URL',
    },
    {
        code: 'vip_annual',
        name: 'Annuel',
        price: 10000,
        period: 'annual' as const,
        durationDays: 365,
        chariowUrl: 'CHANGEME_ANNUAL_CHARIOW_URL',
    },
];

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI manquant dans .env.local');
    await mongoose.connect(uri);

    // 1. Archiver l'ancien "vip_avie" (s'il existe) — ne PAS le supprimer pour préserver
    //    l'historique des Transactions qui le référencent.
    const legacy = await Plan.findOne({ code: 'vip_avie' });
    if (legacy && legacy.isActive) {
        legacy.isActive = false;
        await legacy.save();
        console.log('🗄️  Plan legacy "vip_avie" archivé (isActive=false).');
    } else if (legacy) {
        console.log('ℹ️  Plan legacy "vip_avie" déjà archivé.');
    } else {
        console.log('ℹ️  Pas de plan legacy "vip_avie" à archiver.');
    }

    // 2. Upsert des 3 nouvelles grilles. Idempotent — re-run safe.
    for (const p of PLANS) {
        const existing = await Plan.findOne({ code: p.code });
        if (existing) {
            existing.name = p.name;
            existing.price = p.price;
            existing.period = p.period;
            existing.durationDays = p.durationDays;
            // On préserve la chariowUrl déjà saisie (l'admin l'a peut-être éditée manuellement).
            if (!existing.chariowUrl || existing.chariowUrl.startsWith('CHANGEME')) {
                existing.chariowUrl = p.chariowUrl;
            }
            existing.isActive = true;
            await existing.save();
            console.log(`🔄 Plan "${p.code}" mis à jour (${p.price} FCFA, ${p.durationDays}j).`);
        } else {
            await Plan.create({ ...p, isActive: true });
            console.log(`✅ Plan "${p.code}" créé (${p.price} FCFA, ${p.durationDays}j).`);
        }
    }

    // 3. Diagnostic final
    const placeholders = await Plan.find({
        isActive: true,
        chariowUrl: { $regex: '^CHANGEME' },
    }).select('code chariowUrl');
    if (placeholders.length > 0) {
        console.warn('\n⚠️  ATTENTION : URLs Chariow placeholders à remplacer pour les plans actifs :');
        placeholders.forEach((p: any) => console.warn(`   • ${p.code} → ${p.chariowUrl}`));
        console.warn('   Édite-les en base (collection plans) ou re-lance ce seed après mise à jour de PLANS.');
    } else {
        console.log('\n✅ Tous les plans actifs ont une chariowUrl valide.');
    }

    await mongoose.disconnect();
}

seed().catch((e) => {
    console.error('❌ Seed échoué :', e);
    process.exit(1);
});
