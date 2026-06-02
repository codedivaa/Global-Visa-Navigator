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
  missingRequirements: string[];
  explanation: string;
  isTargetCountry: boolean;
};

export type AlternativeCountry = {
  country: string;
  flag: string;
  topScore: number;
  topVisa: VisaScore;
};

export type ScoringResult = {
  targetCountryVisas: VisaScore[];
  alternativeCountries: AlternativeCountry[];
  topMatches: VisaScore[];          // kept for backward compat (target first, then alternatives)
  overallScore: number;
  overallCategory: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function degreePoints(degree: string): number {
  const map: Record<string, number> = {
    'phd': 20, "master's": 16, "bachelor's": 12, 'high school': 4,
  };
  return map[degree?.toLowerCase()] ?? 8;
}

function expPoints(exp: number): number {
  if (exp >= 10) return 20;
  if (exp >= 7)  return 17;
  if (exp >= 5)  return 14;
  if (exp >= 3)  return 11;
  if (exp >= 1)  return 7;
  return 3;
}

function englishPoints(level: string): number {
  const map: Record<string, number> = {
    'native/fluent': 15, 'advanced': 13, 'intermediate': 8, 'basic': 2,
  };
  return map[level?.toLowerCase()] ?? 6;
}

function agePoints(age: number): number {
  if (age >= 25 && age <= 32) return 10;
  if (age >= 33 && age <= 39) return 8;
  if (age >= 20 && age <= 24) return 6;
  if (age >= 40 && age <= 44) return 4;
  return 2;
}

function getCategory(score: number): string {
  if (score >= 88) return 'Excellent Match';
  if (score >= 72) return 'Strong Match';
  if (score >= 55) return 'Moderate Match';
  if (score >= 35) return 'Developing Match';
  return 'Weak Match';
}

function normalise(country: string): string {
  return (country ?? '').toLowerCase().trim();
}

// ── Per-visa scoring configuration ───────────────────────────────────────────
// Controls how much each factor matters for this specific visa type
type VisaCfg = {
  eduWeight: number;   // 0.5 – 1.8
  expWeight: number;
  engWeight: number;   // 0 = language doesn't matter, 1.8 = heavily weighted
  ageWeight: number;
  jobBonus: number;    // pts for job offer in target country
  noJobPenalty: number;// pts deducted when NO job offer (0 = no penalty)
  sponsorRequired: boolean;
  countryAlignmentBonus: number; // how much the target-country match is worth (default 25)
};

const VISA_CFG: Record<string, VisaCfg> = {
  'h1b':          { eduWeight: 1.0, expWeight: 1.1, engWeight: 1.6, ageWeight: 0.8, jobBonus: 18, noJobPenalty: 25, sponsorRequired: true, countryAlignmentBonus: 25 },
  'o1a':          { eduWeight: 1.0, expWeight: 1.5, engWeight: 1.4, ageWeight: 0.7, jobBonus: 8,  noJobPenalty: 5,  sponsorRequired: true, countryAlignmentBonus: 25 },
  'eb2niw':       { eduWeight: 1.6, expWeight: 1.3, engWeight: 1.2, ageWeight: 0.7, jobBonus: 5,  noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'canada-ee':    { eduWeight: 1.1, expWeight: 1.1, engWeight: 1.7, ageWeight: 1.5, jobBonus: 10, noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'canada-pnp':   { eduWeight: 1.0, expWeight: 1.2, engWeight: 1.4, ageWeight: 1.2, jobBonus: 12, noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'uk-sw':        { eduWeight: 0.9, expWeight: 1.1, engWeight: 1.6, ageWeight: 0.8, jobBonus: 20, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'uk-gt':        { eduWeight: 1.2, expWeight: 1.6, engWeight: 1.5, ageWeight: 0.7, jobBonus: 5,  noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'australia-189':{ eduWeight: 1.2, expWeight: 1.3, engWeight: 1.5, ageWeight: 1.4, jobBonus: 8,  noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'australia-186':{ eduWeight: 1.0, expWeight: 1.3, engWeight: 1.3, ageWeight: 1.3, jobBonus: 20, noJobPenalty: 20, sponsorRequired: true, countryAlignmentBonus: 25 },
  'germany-oc':   { eduWeight: 1.5, expWeight: 1.4, engWeight: 0.9, ageWeight: 1.0, jobBonus: 8,  noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'germany-ebc':  { eduWeight: 1.4, expWeight: 1.4, engWeight: 1.0, ageWeight: 0.9, jobBonus: 18, noJobPenalty: 20, sponsorRequired: true, countryAlignmentBonus: 25 },
  'japan-engineer':{ eduWeight: 1.3, expWeight: 1.2, engWeight: 0.6, ageWeight: 0.9, jobBonus: 18, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'japan-hsp':    { eduWeight: 1.5, expWeight: 1.4, engWeight: 0.7, ageWeight: 0.9, jobBonus: 14, noJobPenalty: 18, sponsorRequired: true, countryAlignmentBonus: 25 },
  'japan-startup':{ eduWeight: 1.0, expWeight: 1.3, engWeight: 0.5, ageWeight: 0.9, jobBonus: 0,  noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'sk-e7':        { eduWeight: 1.2, expWeight: 1.3, engWeight: 0.7, ageWeight: 0.9, jobBonus: 18, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'sk-d10':       { eduWeight: 1.3, expWeight: 1.0, engWeight: 0.7, ageWeight: 1.0, jobBonus: 5,  noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'sg-ep':        { eduWeight: 1.3, expWeight: 1.2, engWeight: 1.5, ageWeight: 0.8, jobBonus: 20, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'sg-techpass':  { eduWeight: 1.0, expWeight: 1.7, engWeight: 1.4, ageWeight: 0.7, jobBonus: 5,  noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'nz-skilled':   { eduWeight: 1.1, expWeight: 1.2, engWeight: 1.5, ageWeight: 1.3, jobBonus: 10, noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'nz-aewv':      { eduWeight: 0.9, expWeight: 1.2, engWeight: 1.3, ageWeight: 0.9, jobBonus: 20, noJobPenalty: 20, sponsorRequired: true, countryAlignmentBonus: 25 },
  'france-tp':    { eduWeight: 1.5, expWeight: 1.3, engWeight: 0.8, ageWeight: 0.9, jobBonus: 10, noJobPenalty: 0,  sponsorRequired: false, countryAlignmentBonus: 25 },
  'nl-hsm':       { eduWeight: 1.2, expWeight: 1.3, engWeight: 1.3, ageWeight: 0.8, jobBonus: 20, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'ireland-csp':  { eduWeight: 1.1, expWeight: 1.2, engWeight: 1.6, ageWeight: 0.8, jobBonus: 20, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'sweden-wp':    { eduWeight: 1.0, expWeight: 1.2, engWeight: 1.2, ageWeight: 0.8, jobBonus: 20, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'norway-sw':    { eduWeight: 1.1, expWeight: 1.2, engWeight: 1.2, ageWeight: 0.8, jobBonus: 20, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
  'ch-b-permit':  { eduWeight: 1.3, expWeight: 1.3, engWeight: 1.1, ageWeight: 0.8, jobBonus: 20, noJobPenalty: 22, sponsorRequired: true, countryAlignmentBonus: 25 },
};

function defaultCfg(): VisaCfg {
  return { eduWeight: 1.0, expWeight: 1.0, engWeight: 1.0, ageWeight: 1.0, jobBonus: 10, noJobPenalty: 10, sponsorRequired: false, countryAlignmentBonus: 25 };
}

// ── Language bonus ────────────────────────────────────────────────────────────
// We don't currently collect extra language from the user, so we never award
// the bonus — but we surface it as an improvement suggestion when relevant.
function languageImprovementFor(visa: Visa): string | null {
  const lang = visa.languageRequirement;
  if (!lang) return null;
  return `${lang} would significantly improve your eligibility for ${visa.name}`;
}

// ── Core scorer ───────────────────────────────────────────────────────────────
function scoreVisa(a: Assessment, visa: Visa): VisaScore {
  const cfg = VISA_CFG[visa.id] ?? defaultCfg();

  const targetKey = normalise(a.targetCountry);
  const visaKey   = normalise(visa.countryKey);
  const isTarget  = visaKey === targetKey ||
    (targetKey === 'uk' && visaKey === 'united kingdom') ||
    (targetKey === 'usa' && visaKey === 'united states') ||
    (targetKey === 'south korea' && visaKey === 'south korea') ||
    (targetKey === 'korea' && visaKey === 'south korea');

  const edu = degreePoints(a.degree);
  const exp = expPoints(a.workExperience ?? 0);
  const eng = englishPoints(a.englishScore);
  const age = agePoints(a.age ?? 28);

  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];
  const missingRequirements: string[] = [];

  // Education
  score += Math.round(edu * cfg.eduWeight);
  if (edu >= 16) strengths.push('Strong educational background');
  else if (edu <= 4) {
    weaknesses.push('Degree level below most visa thresholds');
    improvements.push('A recognised bachelor\'s or master\'s degree would unlock more pathways');
    missingRequirements.push('University degree (bachelor\'s or higher) strongly recommended');
  }

  // Experience
  score += Math.round(exp * cfg.expWeight);
  if (exp >= 14) strengths.push('Extensive skilled work experience');
  else if (exp <= 7) {
    weaknesses.push('Work experience below optimal threshold');
    improvements.push('Aim for 5+ years of skilled professional experience');
  }

  // English
  score += Math.round(eng * cfg.engWeight);
  if (eng >= 13 && cfg.engWeight >= 1.2) {
    strengths.push('Strong English proficiency — key advantage for this pathway');
  } else if (eng <= 8 && cfg.engWeight >= 1.4) {
    weaknesses.push('English level may not meet minimum requirements');
    improvements.push('Achieve IELTS 7.0+ / CLB 9+ or equivalent');
    if (cfg.engWeight >= 1.5) missingRequirements.push('English language test result (IELTS / CELPIP / PTE)');
  }

  // Age
  score += Math.round(age * cfg.ageWeight);
  if (age >= 8 && cfg.ageWeight >= 1.2) strengths.push('Age is within optimal range for this visa');
  if (a.age > 44 && (visa.id === 'australia-189' || visa.id === 'australia-186')) {
    score -= 15;
    missingRequirements.push('Must be under 45 years old — hard age limit for Australian skilled visas');
    weaknesses.push('Age exceeds the 45-year limit for this Australian visa');
  }

  // Job offer
  const hasJobInTarget = a.jobOffer === 'Yes - In Target Country';
  const hasJobRemote   = a.jobOffer === 'Yes - Remote';

  if (hasJobInTarget) {
    score += cfg.jobBonus;
    if (cfg.jobBonus >= 15) strengths.push('Job offer in target country — strong eligibility booster');
    else strengths.push('Job offer strengthens your application');
  } else if (hasJobRemote) {
    score += Math.round(cfg.jobBonus * 0.4);
    if (cfg.sponsorRequired) {
      weaknesses.push('Remote job offer does not satisfy the local employer sponsorship requirement');
      improvements.push(`Find an employer in ${visa.country} willing to sponsor your visa`);
      missingRequirements.push(`Local employer sponsorship / Certificate of Sponsorship (${visa.country})`);
    }
  } else {
    // No job offer
    if (cfg.sponsorRequired) {
      score -= cfg.noJobPenalty;
      weaknesses.push(`${visa.name} requires employer sponsorship — no job offer is a critical gap`);
      improvements.push(`Secure a local employer in ${visa.country} before applying`);
      missingRequirements.push(`Employer sponsor / job offer in ${visa.country} (mandatory)`);
    } else {
      // Points-based / job-search visa — no penalty, but note the bonus
      improvements.push(`A job offer in ${visa.country} would further boost your score`);
    }
  }

  // Target country alignment — the main differentiator
  if (isTarget) {
    score += cfg.countryAlignmentBonus;
    strengths.push(`${visa.country} is your stated target destination`);
  }

  // Travel history bonus
  const travel = a.travelHistory ?? [];
  if (travel.length >= 4) { score += 5; strengths.push('Extensive international travel history'); }
  else if (travel.length >= 2) { score += 3; }

  // Language improvement suggestion (we can't score it — we don't ask)
  const langTip = languageImprovementFor(visa);
  if (langTip) improvements.push(langTip);

  // Country-specific extras
  if (visa.id === 'canada-ee' || visa.id === 'canada-pnp') {
    if (eng >= 13) strengths.push('High CLB score will maximise your CRS points');
    if ((a.workExperience ?? 0) >= 3) strengths.push('1+ year Canadian NOC TEER 0–3 experience counts toward CRS');
  }
  if (visa.id === 'germany-oc') {
    if (edu >= 12) strengths.push('Recognised degree meets Opportunity Card education requirement');
  }
  if (visa.id === 'australia-189' || visa.id === 'nz-skilled') {
    if (edu >= 12) improvements.push('Skills assessment from the relevant authority is the first required step');
    missingRequirements.push('Positive skills assessment from relevant assessing authority');
  }
  if (visa.id === 'eb2niw' && edu < 16) {
    missingRequirements.push('Advanced degree (master\'s or PhD) or proof of exceptional ability');
  }
  if (visa.id === 'uk-gt') {
    if (exp <= 11) {
      improvements.push('Build a recognised portfolio of awards, publications, or leadership at scale');
      missingRequirements.push('Endorsement from a UK-recognised body (Tech Nation, Royal Society, etc.)');
    }
  }
  if (visa.id === 'sg-techpass') {
    if ((a.workExperience ?? 0) < 5) {
      missingRequirements.push('5+ years leading a tech product or as a tech founder (unicorn / significant raise)');
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    visa,
    score,
    category: getCategory(score),
    strengths: [...new Set(strengths)].slice(0, 5),
    weaknesses: [...new Set(weaknesses)].slice(0, 3),
    improvements: [...new Set(improvements)].slice(0, 4),
    missingRequirements: [...new Set(missingRequirements)].slice(0, 4),
    explanation: `Based on your profile, you have a ${getCategory(score).toLowerCase()} for the ${visa.name}.`,
    isTargetCountry: isTarget,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────
export function calculateScores(assessment: Assessment): ScoringResult {
  const a = assessment;

  const all: VisaScore[] = visas.map(v => scoreVisa(a, v));

  const targetKey = normalise(a.targetCountry);
  const targetVisas = all
    .filter(r => r.isTargetCountry)
    .sort((x, y) => y.score - x.score);

  // Group non-target visas by country, pick top visa per country
  const altMap = new Map<string, VisaScore>();
  for (const r of all) {
    if (r.isTargetCountry) continue;
    const key = r.visa.countryKey;
    const prev = altMap.get(key);
    if (!prev || r.score > prev.score) altMap.set(key, r);
  }

  const targetBestScore = targetVisas[0]?.score ?? 0;

  const alternativeCountries: AlternativeCountry[] = [...altMap.values()]
    .filter(r => r.score > targetBestScore)           // only genuinely stronger
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(r => ({
      country: r.visa.country,
      flag: r.visa.flag,
      topScore: r.score,
      topVisa: r,
    }));

  // topMatches = target country first, then best alternatives
  const topMatches = [
    ...targetVisas.slice(0, 2),
    ...alternativeCountries.slice(0, 2).map(ac => ac.topVisa),
  ].slice(0, 4);

  const primary = targetVisas[0] ?? all.sort((x, y) => y.score - x.score)[0];

  return {
    targetCountryVisas: targetVisas,
    alternativeCountries,
    topMatches,
    overallScore: primary?.score ?? 0,
    overallCategory: primary?.category ?? 'Weak Match',
    strengths: primary?.strengths ?? [],
    weaknesses: primary?.weaknesses ?? [],
    improvements: primary?.improvements ?? [],
  };
}
