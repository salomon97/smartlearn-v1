import { describe, it, expect } from 'vitest';
import { computeHealthScore } from './retention-core';

describe('computeHealthScore', () => {
  it('élève pleinement actif aujourd\'hui → 100 / healthy', () => {
    expect(computeHealthScore({ recencyDays: 0, activeDays14: 7, lessonsCompleted14: 4 }))
      .toEqual({ score: 100, status: 'healthy' });
  });

  it('inactivité > 21 jours → churned (score 0)', () => {
    expect(computeHealthScore({ recencyDays: 25, activeDays14: 0, lessonsCompleted14: 0 }))
      .toEqual({ score: 0, status: 'churned' });
  });

  it('inactivité 7-21 jours → at_risk même avec bon score brut', () => {
    // recency = 100*(1-10/21)=52.38 ; score = 0.4*52.38 + 30 + 30 = 80.95 → 81
    expect(computeHealthScore({ recencyDays: 10, activeDays14: 7, lessonsCompleted14: 4 }))
      .toEqual({ score: 81, status: 'at_risk' });
  });

  it('score 40-69 et récent → cooling', () => {
    // recency=85.71, freq=28.57, prog=25 → 0.4*85.71+0.3*28.57+0.3*25 = 50.35 → 50
    expect(computeHealthScore({ recencyDays: 3, activeDays14: 2, lessonsCompleted14: 1 }))
      .toEqual({ score: 50, status: 'cooling' });
  });

  it('score 15-39 et récent → at_risk', () => {
    // recency=76.19, freq=14.29, prog=0 → 0.4*76.19+0.3*14.29 = 34.76 → 35
    expect(computeHealthScore({ recencyDays: 5, activeDays14: 1, lessonsCompleted14: 0 }))
      .toEqual({ score: 35, status: 'at_risk' });
  });

  it('progress est plafonné à 100 ; frontière healthy à 70', () => {
    // recency=100, freq=0, prog=(20/4)*100=500→100 → 0.4*100 + 0.3*100 = 70
    expect(computeHealthScore({ recencyDays: 0, activeDays14: 0, lessonsCompleted14: 20 }))
      .toEqual({ score: 70, status: 'healthy' });
  });

  it('objectif 0 → progress neutralisé (pas de division par zéro)', () => {
    // recency=100, freq=0, prog=0 → 40 → cooling
    expect(computeHealthScore({ recencyDays: 0, activeDays14: 0, lessonsCompleted14: 5, objective: 0 }))
      .toEqual({ score: 40, status: 'cooling' });
  });
});
