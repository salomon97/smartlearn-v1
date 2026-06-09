const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const emails = ['salomonfoe158@gmail.com', 'foesalomon65@gmail.com'];
        console.log('\n========== UTILISATEURS ==========');
        for (const email of emails) {
            const u = await db.collection('users').findOne({ email });
            if (!u) {
                console.log(`\n[${email}] ❌ INTROUVABLE`);
                continue;
            }
            console.log(`\n[${email}]`);
            console.log(`  _id           : ${u._id}`);
            console.log(`  role          : ${u.role}`);
            console.log(`  isPremium     : ${u.isPremium}`);
            console.log(`  premiumUntil  : ${u.premiumUntil}`);
            console.log(`  grade_level   : ${u.grade_level}`);
        }

        console.log('\n========== TRANSACTIONS SALESMCKJA553NM4RJQ ==========');
        const txs = await db.collection('transactions').find({ referenceId: 'SALESMCKJA553NM4RJQ' }).toArray();
        if (txs.length === 0) {
            console.log('  Aucune transaction trouvée avec ce referenceId');
        } else {
            txs.forEach((t, i) => {
                console.log(`\n  TX #${i + 1}`);
                console.log(`    _id           : ${t._id}`);
                console.log(`    userId        : ${t.userId}`);
                console.log(`    amount        : ${t.amount}`);
                console.log(`    planCode      : ${t.planCode}`);
                console.log(`    paymentMethod : ${t.paymentMethod}`);
                console.log(`    status        : ${t.status}`);
                console.log(`    createdAt     : ${t.createdAt}`);
                console.log(`    metadata      : ${JSON.stringify(t.metadata)}`);
            });
        }

        console.log('\n========== 5 DERNIERS WEBHOOK_LOGS (timestamp + sale.id) ==========');
        const logs = await db.collection('webhook_logs')
            .find({})
            .sort({ receivedAt: -1 })
            .limit(5)
            .toArray();
        logs.forEach((l, i) => {
            const saleId = l.body?.sale?.id || l.body?.data?.id || l.body?.id || 'N/A';
            const email = l.body?.customer?.email || 'N/A';
            console.log(`  #${i + 1}  ${l.receivedAt.toISOString()}  sale=${saleId}  customer=${email}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
