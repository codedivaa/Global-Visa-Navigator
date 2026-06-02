export type { Assessment, ScoringResult, VisaScore } from '../lib/scoring';
export type { Visa } from '../data/visas';

export const ASSESSMENT_KEY = 'visapath_assessment';

export function saveAssessment(data: Record<string, unknown>): void {
  localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
}

export function loadAssessment(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(ASSESSMENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}