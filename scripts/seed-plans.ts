import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../src/models/Plan';

dotenv.config({ path: '.env.local' });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI manquant dans .env.local');
  await mongoose.connect(uri);

  const code = 'vip_avie';
  const existing = await Plan.findOne({ code });
  if (existing) {
    console.log(`ℹ️ Plan "${code}" déjà présent — aucune action.`);
  } else {
    await Plan.create({
      code,
      name: 'Accès Illimité - À Vie',
      price: 2000,
      chariowUrl: 'https://wttjdkki.mychariow.shop/prd_pihhbz',
      isActive: true,
    });
    console.log(`✅ Plan "${code}" créé (2000 FCFA).`);
  }

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('❌ Seed échoué :', e);
  process.exit(1);
});
