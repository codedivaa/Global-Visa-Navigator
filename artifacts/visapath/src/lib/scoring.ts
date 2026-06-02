import { visas, type Visa } from '../data/visas';

export type Assessment = {
  nationality: string;
  currentCountry: string;
  targetCountry: string;
  age: number;
  degree: string;
  workExperience: number;
  englishScore: string;
  jobOffer: string;
  travelHistory: string[];
};

export type VisaScore = {
  visa: Visa;
  score: number;
  category: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  explanation: string;
};

export type ScoringResult = {
  topMatches: VisaScore[];
  overallScore: number;
  overallCategory: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
};

function degreeScore(degree: string): number {
  const map: Record<string, number> = { 'phd': 25, "master's": 20, "bachelor's": 15, 'high school': 5 };
  return map[degree?.toLowerCase()] ?? 10;
}

function expScore(exp: number): number {
  if (exp >= 10) return 25;
  if (exp >= 5) return 20;
  if (exp >= 3) return 15;
  if (exp >= 1) return 10;
  return 5;
}

function calcEnglishScore(level: string): number {
  const map: Record<string, number> = { 'native/fluent': 20, 'advanced': 17, 'intermediate': 12, 'basic': 5 };
  return map[level?.toLowerCase()] ?? 10;
}

function ageScore(age: number): number {
  if (age >= 25 && age <= 35) return 15;
  if (age >= 36 && age <= 40) return 12;
  if (age >= 20 && age <= 24) return 10;
  return 5;
}

function getCategory(score: number): string {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Moderate Match';
  return 'Weak Match';
}

export function calculateScores(assessment: Assessment): ScoringResult {
  const a = assessment;

  const results: VisaScore[] = visas.map(visa => {
    let score = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const improvements: string[] = [];

    const deg = degreeScore(a.degree);
    const exp = expScore(a.workExperience ?? 0);
    const eng = calcEnglishScore(a.englishScore);
    const age = ageScore(a.age ?? 28);

    const isCanada = visa.id === 'canada-ee';
    const isGermany = visa.id === 'germany-oc';
    const isH1B = visa.id === 'h1b';

    // --- Education ---
    // Germany strongly favors recognized degrees
    const degWeight = isGermany ? 1.6 : 1.0;
    score += Math.round(deg * degWeight);
    if (deg >= 20) strengths.push('Strong educational background');
    else if (deg < 10) {
      weaknesses.push('Higher degree may improve eligibility');
      improvements.push('Consider pursuing a Masters degree');
    }

    // --- Work Experience ---
    // Germany strongly favors experience
    const expWeight = isGermany ? 1.6 : 1.0;
    score += Math.round(exp * expWeight);
    if (exp >= 20) strengths.push('Extensive work experience');
    else if (exp < 10) {
      weaknesses.push('Limited work experience');
      improvements.push('Gain at least 3 years of relevant work experience');
    }

    // --- English Proficiency ---
    // Canada (Express Entry) strongly favors English
    const engWeight = isCanada ? 1.7 : 1.0;
    score += Math.round(eng * engWeight);
    if (eng >= 17) strengths.push('Excellent English proficiency');
    else if (eng < 12) {
      weaknesses.push('English proficiency needs improvement');
      improvements.push('Achieve IELTS 7.0+ or equivalent');
    }

    // --- Age ---
    // Canada Express Entry strongly favors optimal age range
    const ageWeight = isCanada ? 1.5 : 1.0;
    score += Math.round(age * ageWeight);
    if (age >= 15) strengths.push('Optimal age range for immigration programs');

    // --- Job Offer ---
    // H-1B strongly requires a job offer; no offer = near-zero score for H-1B
    if (a.jobOffer === 'Yes - In Target Country') {
      const jobPoints = isH1B ? 30 : 15;
      score += jobPoints;
      strengths.push('Strong job offer in target country');
    } else if (a.jobOffer === 'Yes - Remote') {
      const jobPoints = isH1B ? 10 : 8;
      score += jobPoints;
      strengths.push('Remote job offer strengthens application');
    } else {
      if (isH1B) {
        score -= 20; // H-1B is employer-sponsored; no offer is a major blocker
        weaknesses.push('H-1B requires a US employer sponsor — no job offer is a critical gap');
        improvements.push('Secure a US employer willing to sponsor your H-1B');
      } else {
        improvements.push('Securing a job offer in ' + visa.country + ' would significantly boost eligibility');
      }
    }

    // --- Target Country Alignment ---
    const targetLower = (a.targetCountry ?? '').toLowerCase();
    if (visa.country === 'Canada' && targetLower.includes('canada')) score += 10;
    else if (visa.country === 'USA' && (targetLower.includes('usa') || targetLower.includes('united states'))) score += 10;
    else if (visa.country === 'Germany' && targetLower.includes('germany')) score += 10;
    else if (visa.country === 'UK' && (targetLower.includes('uk') || targetLower.includes('united kingdom'))) score += 10;
    else if (visa.country === 'Australia' && targetLower.includes('australia')) score += 10;
    else score += 2;

    // --- Travel History ---
    if ((a.travelHistory ?? []).length >= 3) {
      score += 5;
      strengths.push('Strong international travel history');
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      visa,
      score,
      category: getCategory(score),
      strengths: [...new Set(strengths)].slice(0, 4),
      weaknesses: [...new Set(weaknesses)].slice(0, 3),
      improvements: [...new Set(improvements)].slice(0, 3),
      explanation: 'Based on your profile, you have a ' + getCategory(score).toLowerCase() + ' for the ' + visa.name + '.',
    };
  });

  const sorted = results.sort((a, b) => b.score - a.score);
  const top = sorted[0];

  return {
    topMatches: sorted.slice(0, 3),
    overallScore: top?.score ?? 0,
    overallCategory: top?.category ?? 'Weak Match',
    strengths: top?.strengths ?? [],
    weaknesses: top?.weaknesses ?? [],
    improvements: top?.improvements ?? [],
  };
}
