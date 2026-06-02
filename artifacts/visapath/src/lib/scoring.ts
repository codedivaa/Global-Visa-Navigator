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
    score += deg;
    if (deg >= 20) strengths.push('Strong educational background');
    else if (deg < 10) { weaknesses.push('Higher degree may improve eligibility'); improvements.push('Consider pursuing a Masters degree'); }

    const exp = expScore(a.workExperience ?? 0);
    score += exp;
    if (exp >= 20) strengths.push('Extensive work experience');
    else if (exp < 10) { weaknesses.push('Limited work experience'); improvements.push('Gain at least 3 years of relevant work experience'); }

    const eng = calcEnglishScore(a.englishScore);
    score += eng;
    if (eng >= 17) strengths.push('Excellent English proficiency');
    else if (eng < 12) { weaknesses.push('English proficiency needs improvement'); improvements.push('Achieve IELTS 7.0+ or equivalent'); }

    const age = ageScore(a.age ?? 28);
    score += age;
    if (age >= 15) strengths.push('Optimal age range for immigration programs');

    if (a.jobOffer === 'Yes - In Target Country') {
      score += 15;
      strengths.push('Strong job offer in target country');
    } else if (a.jobOffer === 'Yes - Remote') {
      score += 8;
      strengths.push('Remote job offer strengthens application');
    } else {
      improvements.push('Securing a job offer in ' + visa.country + ' would significantly boost eligibility');
    }

    const targetLower = (a.targetCountry ?? '').toLowerCase();
    if (visa.country === 'Canada' && targetLower.includes('canada')) score += 10;
    else if (visa.country === 'USA' && (targetLower.includes('usa') || targetLower.includes('united states'))) score += 10;
    else if (visa.country === 'Germany' && targetLower.includes('germany')) score += 10;
    else if (visa.country === 'UK' && (targetLower.includes('uk') || targetLower.includes('united kingdom'))) score += 10;
    else if (visa.country === 'Australia' && targetLower.includes('australia')) score += 10;
    else score += 2;

    if ((a.travelHistory ?? []).length >= 3) { score += 5; strengths.push('Strong international travel history'); }

    score = Math.min(100, Math.round(score));

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