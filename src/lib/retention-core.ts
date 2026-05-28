// Logique de scoring de santé élève — PURE (aucun import, aucune dépendance DB).
// Source de vérité du Moteur de Rétention. Recalcul idempotent.

export type HealthInputs = {
  recencyDays: number;        // jours depuis la dernière activité (0 = aujourd'hui)
  activeDays14: number;       // jours actifs distincts sur les 14 derniers jours
  lessonsCompleted14: number; // leçons complétées sur les 14 derniers jours
  objective?: number;         // objectif de leçons / 14j (défaut 4)
};

export type HealthStatus = 'healthy' | 'cooling' | 'at_risk' | 'churned';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function computeHealthScore(inp: HealthInputs): { score: number; status: HealthStatus } {
  const objective = inp.objective ?? 4;

  // recency : 100 si activité aujourd'hui, décroissance linéaire jusqu'à 0 sur 21 jours.
  const recency = clamp(100 * (1 - inp.recencyDays / 21), 0, 100);
  // frequency : (jours actifs sur 14 / 7) * 100, plafonné à 100.
  const frequency = clamp((inp.activeDays14 / 7) * 100, 0, 100);
  // progress : (leçons complétées sur 14 / objectif) * 100, plafonné à 100.
  const progress = objective > 0 ? clamp((inp.lessonsCompleted14 / objective) * 100, 0, 100) : 0;

  const raw = clamp(0.40 * recency + 0.30 * frequency + 0.30 * progress, 0, 100);
  const score = Math.round(raw);

  return { score, status: computeStatus(score, inp.recencyDays) };
}

// L'inactivité prime : un élève inactif est à risque/churned quel que soit un score brut résiduel.
function computeStatus(score: number, recencyDays: number): HealthStatus {
  if (score < 15 || recencyDays > 21) return 'churned';
  if ((score >= 15 && score <= 39) || (recencyDays >= 7 && recencyDays <= 21)) return 'at_risk';
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'cooling';
  return 'at_risk';
}
