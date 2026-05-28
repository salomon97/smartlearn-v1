import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongoose";
import StudentHealth from "@/models/StudentHealth";
import Reengagement from "@/models/Reengagement";
import ReengagementLog from "@/models/ReengagementLog";
import User from "@/models/User";
import { computeCohorts } from "@/lib/retention-queries";
import RelanceButton from "./RelanceButton";

const DAY = 24 * 60 * 60 * 1000;

const STATUS_META: Record<string, { label: string; bar: string; text: string; bg: string }> = {
  healthy: { label: "En forme", bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  cooling: { label: "Refroidit", bar: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50" },
  at_risk: { label: "À risque", bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  churned: { label: "Décroché", bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function pct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export default async function RetentionPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") redirect("/dashboard");

  await connectToDatabase();
  const now = Date.now();

  const [healthRows, { cohorts, summary }] = await Promise.all([
    StudentHealth.find().select("userId score status recencyDays lastActivityAt").lean() as any,
    computeCohorts(6),
  ]);

  const dist: Record<string, number> = { healthy: 0, cooling: 0, at_risk: 0, churned: 0 };
  for (const r of healthRows as any[]) dist[r.status] = (dist[r.status] || 0) + 1;
  const totalTracked = (healthRows as any[]).length || 1;

  const recovered30 = await Reengagement.countDocuments({
    status: "recovered",
    recoveredAt: { $gte: new Date(now - 30 * DAY) },
  });

  const atRisk = (healthRows as any[])
    .filter((r) => r.status === "at_risk")
    .sort((a, b) => a.score - b.score)
    .slice(0, 50);
  const ids = atRisk.map((r) => r.userId);
  const users = (await User.find({ _id: { $in: ids } }).select("name email").lean()) as any[];
  const userMap = new Map(users.map((u) => [String(u._id), u]));
  const activeReengs = (await Reengagement.find({ userId: { $in: ids }, status: "active" })
    .select("userId sequenceStep")
    .lean()) as any[];
  const stepMap = new Map(activeReengs.map((r) => [String(r.userId), r.sequenceStep]));

  const logs = (await ReengagementLog.find().sort({ sentAt: -1 }).limit(10).lean()) as any[];

  const w4Gap = summary.w4Rate - 0.4; // écart à la cible 40 %

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Rétention</h1>
        <p className="text-gray-500 font-medium">
          Phase de Preuve · objectif <span className="font-bold text-brand-orange">W4 &gt; 40 %</span>. La seule
          métrique qui compte aujourd&apos;hui.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
          <div className="text-gray-400 text-xs font-black uppercase tracking-widest">Actifs W4</div>
          <div className="text-4xl font-black text-gray-900">{summary.w4Active}</div>
          <div className="text-[11px] text-gray-400">sur {summary.matureSize} élèves matures</div>
        </div>
        <div
          className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-32 ${
            summary.w4Rate >= 0.4 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
          }`}
        >
          <div className={`text-xs font-black uppercase tracking-widest ${summary.w4Rate >= 0.4 ? "text-emerald-600/60" : "text-amber-600/60"}`}>
            Rétention W4
          </div>
          <div className={`text-4xl font-black ${summary.w4Rate >= 0.4 ? "text-emerald-600" : "text-amber-600"}`}>
            {pct(summary.w4Rate)}
          </div>
          <div className="text-[11px] font-bold text-gray-400">
            cible 40 % · écart {w4Gap >= 0 ? "+" : ""}
            {Math.round(w4Gap * 100)} pts
          </div>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm flex flex-col justify-between h-32">
          <div className="text-amber-600/60 text-xs font-black uppercase tracking-widest">À risque</div>
          <div className="text-4xl font-black text-amber-600">{dist.at_risk}</div>
          <div className="text-[11px] text-gray-400">décrocheurs potentiels</div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between h-32">
          <div className="text-emerald-600/60 text-xs font-black uppercase tracking-widest">Récupérés (30j)</div>
          <div className="text-4xl font-black text-emerald-600">{recovered30}</div>
          <div className="text-[11px] text-gray-400">revenus après relance</div>
        </div>
      </div>

      {/* Distribution santé */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Distribution de la santé élève</h2>
        <div className="flex w-full h-4 rounded-full overflow-hidden mb-4">
          {(["healthy", "cooling", "at_risk", "churned"] as const).map((s) =>
            dist[s] > 0 ? (
              <div key={s} className={STATUS_META[s].bar} style={{ width: `${(dist[s] / totalTracked) * 100}%` }} />
            ) : null,
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["healthy", "cooling", "at_risk", "churned"] as const).map((s) => (
            <div key={s} className={`${STATUS_META[s].bg} rounded-2xl p-3`}>
              <div className={`text-2xl font-black ${STATUS_META[s].text}`}>{dist[s]}</div>
              <div className="text-xs font-bold text-gray-500">{STATUS_META[s].label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cohortes */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Rétention par cohorte hebdomadaire</h2>
        {cohorts.length === 0 ? (
          <p className="text-sm text-gray-500">Pas encore de cohorte (aucun élève inscrit avec événements).</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-2 pr-4">Cohorte</th>
                  <th className="py-2 pr-4">Taille</th>
                  <th className="py-2 pr-4">W1</th>
                  <th className="py-2 pr-4">W4</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.weekStart} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {c.label}
                      {!c.mature && <span className="ml-2 text-[10px] text-gray-400">(W4 en cours)</span>}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{c.size}</td>
                    <td className="py-3 pr-4 font-bold text-sky-600">{pct(c.w1Rate)}</td>
                    <td className={`py-3 pr-4 font-black ${c.w4Rate >= 0.4 ? "text-emerald-600" : "text-amber-600"}`}>
                      {c.mature ? pct(c.w4Rate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* À risque + relance */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Élèves à risque ({atRisk.length})</h2>
        {atRisk.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun élève à risque pour le moment. 🎉</p>
        ) : (
          <div className="space-y-2">
            {atRisk.map((r) => {
              const u = userMap.get(String(r.userId));
              return (
                <div key={r.userId} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{u?.name || "Élève inconnu"}</p>
                    <p className="text-xs text-gray-500 truncate">{u?.email || r.userId}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-amber-600">{r.score}</div>
                    <div className="text-[10px] text-gray-400">score</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-sm font-bold text-gray-700">{fmtDate(r.lastActivityAt)}</div>
                    <div className="text-[10px] text-gray-400">dernière activité</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-sm font-bold text-gray-700">{stepMap.get(String(r.userId)) ?? "—"}</div>
                    <div className="text-[10px] text-gray-400">étape relance</div>
                  </div>
                  <RelanceButton userId={String(r.userId)} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feed relances */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Dernières relances</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune relance envoyée pour l&apos;instant.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((l) => (
              <div key={String(l._id)} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{l.subject}</p>
                  <p className="text-xs text-gray-400">
                    étape {l.step} · {l.channel} · {l.provider}
                    {l.delivered ? " · livré" : " · log"}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-3">{fmtDate(l.sentAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
