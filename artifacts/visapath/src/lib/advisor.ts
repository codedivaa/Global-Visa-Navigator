import type { Assessment } from './scoring';
import { visas } from '../data/visas';

const responseMap: Record<string, string[]> = {
  fees: [
    'Processing fees vary by visa type. The Canada Express Entry costs approximately CAD $1,325, while UK Skilled Worker ranges from GBP 610-1,408. Germany Opportunity Card is just EUR 75. Would you like a breakdown for your target country?',
    'Visa fees typically cover the government application fee only. Attorney fees (if applicable) can add $1,000-$5,000 on top. I recommend budgeting 20% extra for documentation and translation costs.',
  ],
  processing: [
    'Processing times in 2024: Canada Express Entry averages 6-9 months, Germany Opportunity Card 2-3 months, UK Skilled Worker 3-5 months, and Australia Skilled visa 12-18 months. These can vary based on application volume.',
    'Current processing times are affected by application backlogs. Germany is currently the fastest option at 2-3 months. Canada Express Entry draws happen bi-weekly — timing your submission matters.',
  ],
  requirements: [
    'Key requirements across top visa programs: (1) Language proof - IELTS/TOEFL for English-speaking countries, (2) Educational credentials assessment, (3) Work experience documentation, (4) Clean background check, (5) Sufficient funds proof.',
    'For your target country, core requirements include: recognized degree equivalent, minimum work experience threshold, language proficiency test results, and a valid passport. Some visas also require a medical examination.',
  ],
  alternative: [
    'Alternative pathways worth exploring: startup visas (Canada, Netherlands, Germany), digital nomad visas (Portugal, Estonia), or regional/provincial nomination programs that have lower score thresholds than federal programs.',
    'If your first-choice visa score is below 70%, consider: (1) Portugal D7 Passive Income visa, (2) Spain Digital Nomad Visa, (3) Germany Job Seeker Visa, or (4) New Zealand Essential Skills visa as stepping stones.',
  ],
  eligibility: [
    'Your eligibility score is calculated across 6 dimensions: education level, work experience, language proficiency, age, job offer status, and target country alignment. Each dimension contributes weighted points to your total.',
    "To improve your overall eligibility: focus on language scores first (highest ROI), then gain relevant work experience. A Master's degree can add significant points in points-based systems like Canada Express Entry.",
  ],
  default: [
    "That's a great question about immigration strategy. Based on your profile, I recommend focusing on points-based systems (Canada, Australia) which reward your specific qualifications. Would you like me to explain the selection process?",
    'Immigration pathways can be complex. My recommendation is to pursue parallel applications when possible — apply to 2-3 programs simultaneously to maximize your chances. Shall I outline a 6-month action plan?',
    'Based on global immigration trends in 2024, tech and healthcare professionals have the highest approval rates. Your profile aligns well with skilled migration programs. What specific aspect would you like to explore?',
  ],
};

export function generateResponse(message: string, assessment: Assessment | null, topVisa?: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('expensive') || lower.includes('price')) {
    return responseMap.fees[Math.floor(Math.random() * responseMap.fees.length)];
  }
  if (lower.includes('process') || lower.includes('how long') || lower.includes('time') || lower.includes('wait')) {
    return responseMap.processing[Math.floor(Math.random() * responseMap.processing.length)];
  }
  if (lower.includes('require') || lower.includes('need') || lower.includes('document') || lower.includes('official')) {
    return responseMap.requirements[Math.floor(Math.random() * responseMap.requirements.length)];
  }
  if (lower.includes('alternative') || lower.includes('other') || lower.includes('option') || lower.includes('different')) {
    return responseMap.alternative[Math.floor(Math.random() * responseMap.alternative.length)];
  }
  if (lower.includes('eligible') || lower.includes('score') || lower.includes('qualify') || lower.includes('chance')) {
    return responseMap.eligibility[Math.floor(Math.random() * responseMap.eligibility.length)];
  }
  
  if (assessment && topVisa) {
    const visa = visas.find(v => v.id === topVisa);
    if (visa) {
      return 'Based on your profile — ' + (assessment.degree || 'your education') + ' with ' + (assessment.workExperience || 0) + ' years of experience — your strongest match is the ' + visa.name + ' (' + visa.country + '). ' + responseMap.default[Math.floor(Math.random() * responseMap.default.length)];
    }
  }
  
  return responseMap.default[Math.floor(Math.random() * responseMap.default.length)];
}

export function getInitialMessage(assessment: Assessment | null, topVisa?: string): string {
  if (!assessment) {
    return 'Welcome to VisaPath AI. I am your personal immigration intelligence advisor. Complete the assessment first so I can provide personalized guidance based on your profile. What would you like to know about global visa programs?';
  }
  const visa = topVisa ? visas.find(v => v.id === topVisa) : null;
  const visaName = visa ? visa.name + ' (' + visa.country + ')' : 'skilled worker programs';
  return 'I have analyzed your profile. With your ' + (assessment.degree || 'educational background') + ' and ' + (assessment.workExperience || 0) + ' years of work experience, your strongest pathway is the ' + visaName + '. Your English proficiency level of ' + (assessment.englishScore || 'intermediate') + ' is a key factor. I can help you understand fees, processing times, requirements, or alternative pathways. What would you like to explore first?';
}