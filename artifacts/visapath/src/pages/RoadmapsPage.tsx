import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { loadAssessment, type Assessment } from '@/types';
import { calculateScores, type VisaScore } from '@/lib/scoring';
import { useAuth } from '@/contexts/AuthContext';
import { saveRoadmapToDb } from '@/lib/db';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

// ── Document checklists ────────────────────────────────────────────────────────
const DOC_MAP: Record<string, string[]> = {
  'canada-ee': [
    'Valid passport (6+ months validity)',
    'IELTS / CELPIP results (CLB 7+)',
    'Educational Credential Assessment (ECA) from WES or IQAS',
    'Employment reference letters (on company letterhead)',
    'Proof of funds (min. CAD $13,757 for single applicant)',
    'Police clearance certificates (all countries 6+ months)',
    'Medical examination results from IRCC-approved physician',
    'Digital photos meeting IRCC specifications',
    'Provincial nomination letter (if applicable)',
  ],
  'germany-oc': [
    'Valid passport',
    'Recognised degree certificate (anabin database or KMK recognition)',
    'Proof of German or English proficiency (B2+)',
    'Proof of financial resources (€1,027/month minimum)',
    'Health insurance coverage (full while in Germany)',
    'Biometric passport photos',
    'CV in German/European format (Lebenslauf)',
    'Motivation letter explaining career goals in Germany',
    'Bank statements (last 3 months)',
  ],
  'germany-ebc': [
    'Valid passport',
    'University degree (recognised or equivalent to German standards)',
    'German language certificate (B2+ preferred)',
    'Employment contract with salary above €45,552/year',
    'Health insurance proof',
    'Rental agreement or confirmation of accommodation',
    'CV and academic transcripts',
  ],
  'h1b': [
    'Valid passport',
    'Form I-129 (filed by employer)',
    'Labor Condition Application (LCA) — employer submits',
    'Degree transcripts + official diploma',
    'Employment offer letter (detailing role, salary)',
    'DS-160 nonimmigrant visa application',
    'SEVIS fee receipt',
    'Prior US visa / entry records (if any)',
  ],
  'uk-sw': [
    'Valid passport',
    'Certificate of Sponsorship (CoS) from licensed employer',
    'English language proof (B1+ — IELTS, GCSE, or equivalent)',
    'Financial requirement evidence (£1,270 in bank 28 days)',
    'Tuberculosis test results (if from listed country)',
    'Academic qualifications',
    'BRP card biometrics appointment',
    'Healthcare surcharge payment receipt',
  ],
  'uk-gt': [
    'Valid passport',
    'Endorsement letter from Tech Nation / Royal Society / British Academy',
    'Evidence of extraordinary ability (awards, press, salaries)',
    'Peer recommendation letters (3+)',
    'CV detailing career milestones',
  ],
  'australia-189': [
    'Valid passport',
    'Positive skills assessment from relevant authority (ACS, Engineers Australia, etc.)',
    'IELTS results (min. 6.0 overall, no band below 6.0)',
    'Expression of Interest (EOI) via SkillSelect',
    'Health examination certificate (HAP ID)',
    'Police clearances for all countries lived in 12+ months',
    'Employment records (last 10 years)',
    'Character form (Form 80)',
  ],
  'japan-engineer': [
    'Valid passport',
    'Certificate of Eligibility (COE) — employer applies in Japan',
    'University degree transcripts (in STEM / related field)',
    'Employment contract from Japanese company',
    'Resume / CV in Japanese format (rirekisho)',
    'JLPT certificate (if available — N3+ strongly recommended)',
    'Graduated from Japanese university OR 3+ years relevant experience',
    'Application form (Visa Application Form for Japan)',
  ],
  'japan-hsp': [
    'Valid passport',
    'Certificate of Eligibility (COE)',
    'Degree transcripts (Master\'s or PhD strongly preferred)',
    'Employment contract with annual salary documentation',
    'JLPT certificate (N1/N2 adds HSP points)',
    'Publications, patents, or awards evidence',
    'Japanese Points Calculation Sheet',
  ],
  'japan-startup': [
    'Valid passport',
    'Business plan approved by a Japanese municipality',
    'Certificate of Eligibility (COE) from municipality',
    'Proof of sufficient funds (¥5M or more)',
    'Recommendation letter from designated city/prefecture',
    'Business Activity Plan (detailed)',
  ],
  'sk-e7': [
    'Valid passport',
    'Employment contract from Korean company',
    'Degree transcripts + diploma',
    'TOPIK certificate (encouraged — score adds points)',
    'Criminal record certificate from home country',
    'Health check results',
    'Employer\'s business registration certificate',
    'Letter of guarantee from Korean employer',
  ],
  'sg-ep': [
    'Valid passport',
    'Employment Pass application via MyMOM Portal (employer applies)',
    'Educational certificates and transcripts',
    'Employer\'s MOM-registered company details',
    'Salary offer letter (SGD 5,000+ for new applicants; SGD 10,500 for finance sector)',
    'Resume / CV',
  ],
  'sg-techpass': [
    'Valid passport',
    'Evidence of leadership at AI / data / cybersecurity / fintech company',
    'Technical portfolio / LinkedIn / GitHub',
    'Letter from reputable VC or tech organisation (if applicable)',
    'Proof of significant salary (top 25th percentile in sector)',
  ],
  'australia-186': [
    'Valid passport',
    'Employer nomination approval',
    'Skills assessment from relevant authority',
    'IELTS results',
    'Health examinations',
    'Character clearances',
    'Employment contract',
  ],
  'nz-skilled': [
    'Valid passport',
    'Skills assessment from relevant NZ authority (NZQA, NZISM, etc.)',
    'IELTS results (minimum band 6.5)',
    'Points Claim Form with evidence',
    'Police clearances',
    'Medical certificates',
    'Employment offer or skilled job offer in NZ',
  ],
  'france-tp': [
    'Valid passport',
    'Talent Passport application dossier',
    'Employment contract or research / creation agreement',
    'Degree transcripts (Master\'s or PhD preferred)',
    'French tax authority proof of sufficient salary',
    'Accommodation proof',
    'French language certificate (not mandatory but helpful)',
    'CV and motivation letter',
  ],
  'nl-hsm': [
    'Valid passport',
    'Employment contract with IND-recognised sponsor',
    'Salary evidence above HSM threshold (€63,894 under 30, €46,107 over 30)',
    'Employer declaration of sponsorship',
    'Educational certificates',
    'Residence permit application (MVV or direct)',
  ],
  'ireland-csp': [
    'Valid passport',
    'Employment contract (€38,000+ annual salary)',
    'Employer letter confirming role on Critical Skills list',
    'Degree certificate',
    'Garda vetting / police clearance',
    'Proof of accommodation',
    'GNIB registration after arrival',
  ],
  'o1a': [
    'Valid passport',
    'Form I-129O petition (by employer or agent)',
    'Evidence of extraordinary ability (major awards, publications, salary, press)',
    'Peer recommendation letters (3+ from recognised experts)',
    'Media coverage / press mentions',
    'Professional memberships in judged panels',
    'Employment contract or agent agreement',
  ],
  'eb2niw': [
    'Valid passport',
    'Form I-140 petition',
    'Advanced degree transcripts (Master\'s or PhD)',
    'National interest benefit statement (detailed)',
    'Evidence of exceptional ability (10-point criteria)',
    'Three independent expert recommendation letters',
    'Published research, patents, or citations (if applicable)',
    'USCIS filing fee receipt',
  ],
};

// ── Application timelines ───────────────────────────────────────────────────────
const MILESTONE_MAP: Record<string, { month: string; label: string; detail: string }[]> = {
  'canada-ee': [
    { month: 'Month 1–2',  label: 'Language Test',          detail: 'Book and complete IELTS or CELPIP — allow 4 weeks for results' },
    { month: 'Month 2–3',  label: 'ECA & Profile Creation', detail: 'Get credentials assessed by WES (8–10 weeks), create Express Entry profile' },
    { month: 'Month 3–8',  label: 'CRS Score & ITA',        detail: 'Improve CRS score via IELTS re-test or provincial nomination; await Invitation to Apply' },
    { month: 'Month 8–9',  label: 'Application Submission', detail: 'Submit full PR application within 60 days of ITA with all documents' },
    { month: 'Month 9–15', label: 'IRCC Processing',        detail: 'Biometrics, medical examination, background checks, COPR issued' },
    { month: 'Month 15+',  label: 'PR Landing',             detail: 'Land in Canada as permanent resident, receive PR card within 8 weeks' },
  ],
  'germany-oc': [
    { month: 'Month 1',    label: 'Document Preparation',      detail: 'Obtain degree recognition (anabin), prepare CV, language cert, funds proof' },
    { month: 'Month 1–3',  label: 'Visa Application',          detail: 'Submit to German embassy; processing 4–12 weeks depending on location' },
    { month: 'Month 3–4',  label: 'Opportunity Card Issued',   detail: 'Receive visa valid for 1 year; travel to Germany' },
    { month: 'Month 4–8',  label: 'Job Search',                detail: 'Actively apply and interview with German employers; register with Agentur für Arbeit' },
    { month: 'Month 8–10', label: 'Work Permit Conversion',    detail: 'Once job offer confirmed, convert to work permit at local Ausländerbehörde' },
    { month: 'Year 3–5',   label: 'Permanent Residency',       detail: 'Apply for Niederlassungserlaubnis after meeting pension and language requirements' },
  ],
  'h1b': [
    { month: 'Oct–Feb',    label: 'Find Employer Sponsor',    detail: 'Secure a US company willing to file H-1B — many start recruitment in autumn' },
    { month: 'Mar 1–20',   label: 'USCIS Registration',       detail: 'Employer registers in H-1B lottery ($10 fee); registration window is very short' },
    { month: 'Apr',        label: 'Lottery Selection',        detail: 'USCIS conducts random lottery — ~20% for regular, ~10% for master\'s cap' },
    { month: 'Apr–Jun',    label: 'Petition Filing',          detail: 'Employer files Form I-129 for selected registrants; premium processing (15 days) available' },
    { month: 'Jun–Sep',    label: 'Consular Interview',       detail: 'If outside US, attend visa interview at US embassy or consulate' },
    { month: 'Oct 1',      label: 'H-1B Start Date',          detail: 'Cap-subject H-1B employment can begin October 1st' },
  ],
  'uk-sw': [
    { month: 'Month 1',    label: 'Secure CoS',              detail: 'Employer with valid sponsor licence issues Certificate of Sponsorship' },
    { month: 'Month 1–2',  label: 'Application Submission',  detail: 'Apply online; pay visa fee + NHS surcharge; provide biometrics at UKVCAS' },
    { month: 'Month 2–3',  label: 'Decision',                detail: 'Standard processing 8 weeks; priority service 5 business days available' },
    { month: 'Month 3',    label: 'Travel to UK',            detail: 'Collect BRP card within 10 days of arrival' },
    { month: 'Year 5',     label: 'Indefinite Leave to Remain', detail: 'Apply for ILR after 5 years of continuous residence' },
    { month: 'Year 6+',    label: 'British Citizenship',     detail: 'Apply for naturalisation 12 months after ILR' },
  ],
  'australia-189': [
    { month: 'Month 1–3',  label: 'Skills Assessment',         detail: 'Submit skills assessment to relevant authority (ACS, Engineers Australia, etc.) — 4–12 weeks' },
    { month: 'Month 3–4',  label: 'IELTS & EOI',              detail: 'Achieve IELTS 6.0+ minimum; lodge Expression of Interest in SkillSelect' },
    { month: 'Month 4–12', label: 'Await Invitation',         detail: 'Invited to Apply is points-based — higher points = faster invitation' },
    { month: 'Month 12–14',label: 'Application Submission',   detail: 'Submit visa application within 60 days of invitation with all documentation' },
    { month: 'Month 14–20',label: 'Processing',               detail: 'Health exams (HAP), police clearances, character assessments' },
    { month: 'Month 20+',  label: 'Permanent Residency',      detail: 'Granted PR — must make first entry before grant expiry (usually 5 years)' },
  ],
  'japan-engineer': [
    { month: 'Month 1–2',  label: 'Secure Japanese Employer',   detail: 'Find a company willing to hire and sponsor you — without this, the visa is not possible' },
    { month: 'Month 2–3',  label: 'COE Application',            detail: 'Employer applies for Certificate of Eligibility (COE) at regional immigration office — 1–3 months' },
    { month: 'Month 4–5',  label: 'COE Issuance',               detail: 'COE is issued and sent to you in your home country' },
    { month: 'Month 5–6',  label: 'Visa Application',           detail: 'Apply at Japanese consulate with COE — typically 5 business days processing' },
    { month: 'Month 6',    label: 'Arrive in Japan',            detail: 'Enter on Engineer/Specialist in Humanities visa, register address within 14 days' },
    { month: 'Year 3+',    label: 'Permanent Residency Path',   detail: 'Apply for PR after 10 years (or 3 years with high HSP points score)' },
  ],
  'sk-e7': [
    { month: 'Month 1–2',  label: 'Job Offer',               detail: 'Secure a job offer from a Korean company in an eligible E-7 occupation' },
    { month: 'Month 2–3',  label: 'TOPIK (Optional)',        detail: 'Take TOPIK test — higher scores increase eligibility points' },
    { month: 'Month 3–4',  label: 'Visa Application',        detail: 'Apply at Korean embassy in home country with full document package' },
    { month: 'Month 4–5',  label: 'Entry & ARC Registration',detail: 'Enter South Korea; register for Alien Registration Card (ARC) within 90 days' },
    { month: 'Year 3–5',   label: 'Permanent Residency',     detail: 'F-5 Permanent Resident visa available after 3–5 years with point scores met' },
  ],
  'sg-ep': [
    { month: 'Month 1',    label: 'Employer Applies',         detail: 'Singapore employer submits EP application via MyMOM Portal — online, no paper forms' },
    { month: 'Month 1–2',  label: 'Approval',                detail: 'Online approval usually within 3 weeks; may request additional documents' },
    { month: 'Month 2',    label: 'In-Principle Approval (IPA)', detail: 'IPA letter issued — you can travel to Singapore' },
    { month: 'Month 2–3',  label: 'Card Collection',         detail: 'Complete formalities at MOM services centre; EP card ready 4 business days' },
    { month: 'Year 2+',    label: 'Renewal / PR Application',detail: 'EP renewed every 1–3 years; PR application possible after 2 years with strong ties' },
  ],
  'france-tp': [
    { month: 'Month 1',    label: 'Prepare Dossier',          detail: 'Gather employment contract, degree, financial proofs, motivation letter' },
    { month: 'Month 1–2',  label: 'VFS / Consulate Appointment', detail: 'Book appointment at French embassy — Talent Passport handled by ANEF online' },
    { month: 'Month 2–3',  label: 'OFII Validation',         detail: 'Arrive in France; validate long-stay visa with OFII within 3 months' },
    { month: 'Month 3',    label: 'Titre de Séjour',         detail: 'Receive residence permit — initially 4-year Talent Passport' },
    { month: 'Year 4',     label: 'Renewal',                 detail: 'Renew for another 4 years if contract/activity continues' },
    { month: 'Year 5',     label: 'Permanent Residency',     detail: 'Apply for 10-year carte de résident after 5 years of continuous legal residence' },
  ],
  'ireland-csp': [
    { month: 'Month 1',    label: 'Secure Job Offer',         detail: 'Confirm role is on Critical Skills Eligible Occupations list, salary €38,000+' },
    { month: 'Month 1–2',  label: 'Employment Permit Application', detail: 'Employer or employee applies online via Employment Permits Online; 6–8 week processing' },
    { month: 'Month 2–4',  label: 'Permit Decision',         detail: 'Critical Skills Employment Permit issued; apply for entry clearance / visa if required' },
    { month: 'Month 4–5',  label: 'Arrive & Register',       detail: 'Register with GNIB/IRP within 90 days of arrival for residence stamp' },
    { month: 'Year 2',     label: 'General Employment Permit / PR path', detail: 'After 2 years, employer-independent permission available' },
    { month: 'Year 5',     label: 'Citizenship Eligibility',  detail: 'Irish citizenship by naturalisation after 5 years continuous reckonable residence' },
  ],
  'nz-skilled': [
    { month: 'Month 1–3',  label: 'Skills Assessment',       detail: 'Apply to relevant NZ authority (NZQA, NZISM, etc.) — 8–12 weeks typical' },
    { month: 'Month 3–4',  label: 'IELTS & EOI',            detail: 'Achieve IELTS 6.5+; lodge Expression of Interest in the Skilled Migrant pool' },
    { month: 'Month 4–8',  label: 'Pool Selection',         detail: 'INZ selects highest-scoring candidates — selection every 2 weeks' },
    { month: 'Month 8–11', label: 'Application',            detail: 'Submit Resident Visa application within 4 months of selection' },
    { month: 'Month 11–16',label: 'Processing',             detail: 'Background checks, medicals, character assessments' },
    { month: 'Month 16+',  label: 'Permanent Residence',    detail: 'Resident Visa granted — permanent and travel-enabled after 2 years' },
  ],
  default: [
    { month: 'Month 1–2',  label: 'Research & Preparation', detail: 'Confirm eligibility, gather core documents, book required tests' },
    { month: 'Month 2–4',  label: 'Document Collection',    detail: 'Obtain all certified certificates, translations, and official assessments' },
    { month: 'Month 4–6',  label: 'Application Submission', detail: 'Submit visa application with complete documentation package' },
    { month: 'Month 6–10', label: 'Processing Period',      detail: 'Government review, biometrics, medicals, background checks if required' },
    { month: 'Month 10–14',label: 'Decision & Approval',    detail: 'Receive visa decision; prepare for relocation if approved' },
    { month: 'Month 14+',  label: 'Arrival & Settlement',   detail: 'Arrive in target country, complete registration formalities within required timeframe' },
  ],
};

// ── Pricing breakdowns ─────────────────────────────────────────────────────────
const PRICING_MAP: Record<string, { item: string; cost: string }[]> = {
  'canada-ee': [
    { item: 'IELTS test fee', cost: 'CAD ~$320' },
    { item: 'Educational Credential Assessment (WES)', cost: 'CAD ~$215–$365' },
    { item: 'Express Entry profile (free)', cost: 'CAD $0' },
    { item: 'PR application fee (principal applicant)', cost: 'CAD $1,365' },
    { item: 'Right of Permanent Residence fee', cost: 'CAD $575' },
    { item: 'Medical examination', cost: 'CAD ~$450' },
    { item: 'Police clearance (varies)', cost: 'CAD ~$50–$150' },
    { item: 'Biometrics', cost: 'CAD $85' },
  ],
  'germany-oc': [
    { item: 'Opportunity Card visa fee', cost: '€75' },
    { item: 'German language test (Goethe B2)', cost: '~€200–€250' },
    { item: 'Degree recognition assessment', cost: '€100–€200' },
    { item: 'Document notarisation & translation', cost: '~€200–€400' },
    { item: 'Health insurance (monthly)', cost: '€200–€350/month' },
    { item: 'Settlement registration (Anmeldung)', cost: 'Free' },
  ],
  'h1b': [
    { item: 'USCIS registration fee (employer)', cost: 'USD $10' },
    { item: 'I-129 petition fee (employer)', cost: 'USD $730–$2,460' },
    { item: 'Premium processing (optional)', cost: 'USD $2,805' },
    { item: 'DS-160 visa application', cost: 'USD $185' },
    { item: 'SEVIS fee', cost: 'USD $200' },
  ],
  'uk-sw': [
    { item: 'Visa application fee (3 years)', cost: '£719' },
    { item: 'NHS Immigration Health Surcharge (3 yrs)', cost: '£1,872' },
    { item: 'Biometric enrolment', cost: 'Included' },
    { item: 'IELTS UKVI test', cost: '~£200' },
    { item: 'BRP card (first time)', cost: 'Included' },
  ],
  'australia-189': [
    { item: 'Skills assessment (ACS / Engineers Australia)', cost: 'AUD $500–$1,000' },
    { item: 'IELTS test', cost: 'AUD ~$370' },
    { item: 'Visa application charge (primary)', cost: 'AUD $4,640' },
    { item: 'Health examination (HAP)', cost: 'AUD ~$350–$500' },
    { item: 'Police clearances (per country)', cost: 'AUD ~$50–$150' },
  ],
  'japan-engineer': [
    { item: 'COE application (employer, free)', cost: '¥0' },
    { item: 'Visa application fee', cost: '¥3,000' },
    { item: 'JLPT test fee', cost: '¥5,500–¥7,000' },
    { item: 'Degree evaluation / translation', cost: '¥10,000–¥30,000' },
    { item: 'Resident card registration (free)', cost: '¥0' },
  ],
  'japan-startup': [
    { item: 'Business plan preparation', cost: 'Varies' },
    { item: 'Municipal application fee', cost: 'Free – ¥10,000' },
    { item: 'Visa application fee', cost: '¥3,000' },
    { item: 'Company incorporation fees', cost: '¥150,000–¥250,000' },
    { item: 'Required capital (minimum)', cost: '¥500,000' },
  ],
  'sk-e7': [
    { item: 'Visa application fee', cost: 'KRW ~110,000 (~USD $85)' },
    { item: 'TOPIK registration', cost: 'KRW 40,000 (~USD $30)' },
    { item: 'Document translation / notarisation', cost: 'KRW ~100,000–200,000' },
    { item: 'Alien Registration Card', cost: 'KRW 30,000' },
  ],
  'sg-ep': [
    { item: 'EP application fee', cost: 'SGD $105' },
    { item: 'Card issuance fee', cost: 'SGD $225' },
    { item: 'Document translation (if needed)', cost: 'SGD ~$50–$200' },
  ],
  'france-tp': [
    { item: 'Long-stay visa fee', cost: '€99' },
    { item: 'OFII residence validation', cost: '€200' },
    { item: 'Document translation (certified)', cost: '€50–€150 per document' },
    { item: 'DELF/DALF language test (optional)', cost: '€80–€200' },
  ],
  'ireland-csp': [
    { item: 'Employment Permit application', cost: '€1,000 (refundable if refused)' },
    { item: 'Entry clearance / D visa (if needed)', cost: '€60–€100' },
    { item: 'GNIB / IRP registration', cost: '€300' },
    { item: 'Document notarisation', cost: '€100–€300' },
  ],
  'nz-skilled': [
    { item: 'Skills assessment fee', cost: 'NZD $400–$800' },
    { item: 'IELTS test', cost: 'NZD ~$350' },
    { item: 'Resident Visa application', cost: 'NZD $3,940' },
    { item: 'Police clearances', cost: 'NZD ~$50–$150 per country' },
    { item: 'Medical certificate', cost: 'NZD ~$400' },
  ],
};

export default function RoadmapsPage() {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [topMatch, setTopMatch] = useState<VisaScore | null>(null);
  const [aiRoadmap, setAiRoadmap] = useState<Array<{ month: string; label: string; detail: string }> | null>(null);
  const [aiPricing, setAiPricing] = useState<Array<{ item: string; cost: string }> | null>(null);
  const [aiPricingTotal, setAiPricingTotal] = useState<string | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);

  async function fetchAiRoadmap(data: Assessment, top: VisaScore) {
    setRoadmapLoading(true);
    try {
      const r = await fetch(`${BASE}/api/ai/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment: data, visaId: top.visa.id, visaName: top.visa.name, visaCountry: top.visa.country, score: top.score }),
      });
      const d = await r.json();
      if (Array.isArray(d.steps) && d.steps.length > 0) setAiRoadmap(d.steps);
    } catch { /* fall back to static */ }
    finally { setRoadmapLoading(false); }
  }

  async function fetchAiPricing(data: Assessment, top: VisaScore) {
    setPricingLoading(true);
    try {
      const r = await fetch(`${BASE}/api/ai/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: JSON.stringify({ targetCountry: data.targetCountry, visaName: top.visa.name, immigrationGoal: (data as any).immigrationGoal ?? '', nationality: data.nationality }),
      });
      const d = await r.json();
      if (Array.isArray(d.items) && d.items.length > 0) {
        setAiPricing(d.items);
        if (d.total) setAiPricingTotal(d.total);
      }
    } catch { /* fall back to static */ }
    finally { setPricingLoading(false); }
  }

  useEffect(() => {
    const data = loadAssessment() as Assessment | null;
    if (data) {
      setAssessment(data);
      const scores = calculateScores(data);
      const top = scores.topMatches[0] ?? null;
      setTopMatch(top);
      if (top) {
        fetchAiRoadmap(data, top);
        fetchAiPricing(data, top);
      }
    }
  }, []);

  const milestones = aiRoadmap ?? (topMatch
    ? (MILESTONE_MAP[topMatch.visa.id] ?? MILESTONE_MAP.default)
    : MILESTONE_MAP.default);

  const docs = topMatch ? (DOC_MAP[topMatch.visa.id] ?? []) : [];
  const pricing = aiPricing ?? (topMatch ? (PRICING_MAP[topMatch.visa.id] ?? []) : []);

  useEffect(() => {
    if (!user || !topMatch || roadmapLoading || pricingLoading) return;
    const assessmentId = localStorage.getItem('visapath_assessment_id');
    if (!assessmentId) return;
    saveRoadmapToDb(user.id, assessmentId, { milestones, pricing, aiPricingTotal });
  }, [user, topMatch, roadmapLoading, pricingLoading]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <AnimatedBackground />
      <NavBar activeItem="roadmaps" />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto pt-32 px-6 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 mb-6 border-indigo-bloom/20">
            <Icon icon="lucide:map" className="text-neon-pink text-sm" />
            <span className="text-xs font-mono text-indigo-bloom uppercase tracking-widest">Immigration Roadmap</span>
          </div>
          <h1 className="font-space text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text-animate">Your Path Forward</span>
          </h1>
          <p className="text-xl text-indigo-950/70">
            {topMatch
              ? `Personalised roadmap for ${topMatch.visa.name} — ${topMatch.visa.country}`
              : 'Complete your assessment to get a personalized roadmap'}
          </p>
        </div>

        {!assessment ? (
          <div className="glass-card p-16 flex flex-col items-center text-center gap-6 max-w-xl mx-auto">
            <Icon icon="lucide:clipboard-list" className="text-5xl text-indigo-bloom/40" />
            <h2 className="font-space text-2xl font-bold">No Assessment Found</h2>
            <p className="text-indigo-950/60">Complete the assessment first so we can build your personalized roadmap.</p>
            <Link href="/assessment" className="light-beam-btn px-8 py-4 font-semibold">
              Start Assessment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="flex flex-col gap-6">
              {/* Visa card */}
              {topMatch && (
                <div className="glass-card p-6">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-bloom/60 mb-3">Top Recommendation</div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{topMatch.visa.flag}</span>
                    <div>
                      <div className="font-space font-bold text-lg leading-tight">{topMatch.visa.name}</div>
                      <div className="text-sm text-indigo-950/60">{topMatch.visa.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-space font-bold text-neon-pink">{topMatch.score}%</span>
                    <span className="px-3 py-1 bg-neon-pink/10 text-neon-pink text-xs font-bold rounded-full uppercase">{topMatch.category}</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-bloom/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-bloom to-neon-pink rounded-full"
                      style={{ width: `${topMatch.score}%`, transition: 'width 1s ease-out' }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-indigo-bloom/5 rounded-xl p-3">
                      <Icon icon="lucide:clock" className="text-indigo-bloom mb-1" />
                      <div className="font-medium">{topMatch.visa.processingTime}</div>
                      <div className="text-indigo-950/50">Processing</div>
                    </div>
                    <div className="bg-indigo-bloom/5 rounded-xl p-3">
                      <Icon icon="lucide:wallet" className="text-indigo-bloom mb-1" />
                      <div className="font-medium">{topMatch.visa.estimatedCost}</div>
                      <div className="text-indigo-950/50">Visa fee</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile summary */}
              <div className="glass-card p-6">
                <h3 className="font-space font-bold text-base mb-4 text-indigo-bloom">Profile Summary</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Goal', value: (assessment as Assessment & { immigrationGoal?: string }).immigrationGoal || '—' },
                    { label: 'Education', value: assessment.degree },
                    { label: 'Experience', value: `${assessment.workExperience} years` },
                    { label: 'English', value: assessment.englishScore },
                    { label: 'Job Offer', value: assessment.jobOffer },
                    { label: 'Target', value: assessment.targetCountry },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between border-b border-indigo-bloom/8 pb-2">
                      <span className="text-indigo-950/50">{item.label}</span>
                      <span className="font-medium text-right truncate ml-2 max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <Link href="/advisor" className="light-beam-btn py-4 flex items-center justify-center gap-2 font-semibold">
                <Icon icon="lucide:cpu" />
                Ask AI Advisor
              </Link>
              <Link
                href="/results"
                className="py-4 text-center rounded-full border border-indigo-bloom/20 text-indigo-bloom hover:bg-indigo-bloom/5 active:scale-[0.97] transition-all font-medium text-sm"
              >
                View All Matches
              </Link>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              {/* Timeline */}
              <div className="glass-card p-8">
                <h2 className="font-space font-bold text-xl mb-8 flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="text-neon-pink" />
                  Application Timeline
                  {aiRoadmap && !roadmapLoading && (
                    <span className="ml-auto text-[10px] font-mono bg-indigo-bloom/8 text-indigo-bloom px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Icon icon="lucide:sparkles" className="text-[10px]" /> AI Personalised
                    </span>
                  )}
                </h2>
                {roadmapLoading ? (
                  <div className="space-y-8 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="flex gap-6">
                        <div className="w-8 h-8 rounded-full bg-indigo-bloom/10 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-indigo-bloom/10 rounded w-1/3" />
                          <div className="h-3 bg-indigo-bloom/6 rounded w-full" />
                          <div className="h-3 bg-indigo-bloom/6 rounded w-4/5" />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-indigo-bloom/60 font-mono pt-2">
                      <Icon icon="lucide:sparkles" className="text-neon-pink animate-pulse" />
                      Generating your personalised roadmap…
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-pink via-indigo-bloom to-indigo-bloom/10" />
                    <div className="space-y-8">
                      {milestones.map((m, i) => (
                        <div key={i} className="flex gap-6 relative">
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 ${
                            i === 0
                              ? 'bg-neon-pink border-neon-pink shadow-[0_0_12px_rgba(244,34,114,0.4)]'
                              : 'bg-white border-indigo-bloom/30'
                          }`}>
                            {i === 0
                              ? <Icon icon="lucide:check" className="text-white text-xs" />
                              : <span className="text-[10px] font-mono font-bold text-indigo-bloom">{i + 1}</span>
                            }
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-space font-bold text-base">{m.label}</span>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-neon-pink bg-neon-pink/10 px-2 py-0.5 rounded-full">{m.month}</span>
                            </div>
                            <p className="text-sm text-indigo-950/60">{m.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              {docs.length > 0 && (
                <div className="glass-card p-8">
                  <h2 className="font-space font-bold text-xl mb-6 flex items-center gap-2">
                    <Icon icon="lucide:file-text" className="text-neon-pink" />
                    Required Documents
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {docs.map((doc, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-bloom/3 border border-indigo-bloom/10 hover:border-indigo-bloom/25 hover:bg-white/60 active:scale-[0.98] transition-all cursor-default">
                        <div className="w-5 h-5 rounded-full bg-indigo-bloom/10 border border-indigo-bloom/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon icon="lucide:file" className="text-indigo-bloom text-[10px]" />
                        </div>
                        <span className="text-sm text-indigo-950/80">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing breakdown */}
              {(pricingLoading || pricing.length > 0) && (
                <div className="glass-card p-8">
                  <h2 className="font-space font-bold text-xl mb-6 flex items-center gap-2">
                    <Icon icon="lucide:wallet" className="text-neon-pink" />
                    Cost Breakdown
                    {aiPricing && !pricingLoading && (
                      <span className="ml-auto text-[10px] font-mono bg-indigo-bloom/8 text-indigo-bloom px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Icon icon="lucide:sparkles" className="text-[10px]" /> AI Generated
                      </span>
                    )}
                  </h2>
                  {pricingLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex justify-between py-2 border-b border-indigo-bloom/8">
                          <div className="h-3 bg-indigo-bloom/10 rounded w-1/2" />
                          <div className="h-3 bg-indigo-bloom/10 rounded w-1/5" />
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-xs text-indigo-bloom/60 font-mono pt-2">
                        <Icon icon="lucide:sparkles" className="text-neon-pink animate-pulse" />
                        Generating cost breakdown…
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pricing.map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-indigo-bloom/8 last:border-0">
                          <span className="text-sm text-indigo-950/70">{p.item}</span>
                          <span className="font-mono font-bold text-sm text-indigo-bloom bg-indigo-bloom/6 px-3 py-1 rounded-full">{p.cost}</span>
                        </div>
                      ))}
                      {aiPricingTotal && (
                        <div className="flex items-center justify-between mt-4 p-4 rounded-2xl bg-gradient-to-r from-neon-pink/5 to-indigo-bloom/5 border border-neon-pink/20">
                          <span className="text-sm font-bold text-indigo-bloom uppercase tracking-widest font-mono">Total Estimate</span>
                          <span className="text-xl font-space font-bold text-neon-pink">{aiPricingTotal}</span>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-indigo-bloom/20 text-xs text-indigo-950/40 italic">
                        * Costs are estimates and subject to change. Always verify with official government sources.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Key next steps */}
              <div className="glass-card p-8 border-l-4 border-l-neon-pink">
                <h2 className="font-space font-bold text-xl mb-6 flex items-center gap-2">
                  <Icon icon="lucide:zap" className="text-neon-pink" />
                  Key Next Steps
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: 'lucide:book-open', step: 'Research official requirements', detail: `Visit the official ${topMatch?.visa.country ?? 'destination country'} immigration website to confirm current requirements and fee schedules.` },
                    { icon: 'lucide:mic', step: 'Book language test', detail: 'IELTS, JLPT, TOPIK, Goethe, or equivalent — test slots fill up 4–6 weeks in advance so book early.' },
                    { icon: 'lucide:graduation-cap', step: 'Get credentials assessed', detail: 'Arrange an official credential evaluation from a recognised body in your target country — allow 8–12 weeks.' },
                    { icon: 'lucide:cpu', step: 'Get personalised AI guidance', detail: 'Use the AI Advisor to get specific answers about your application, fees, and what to do next.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/50 active:scale-[0.98] transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center flex-shrink-0">
                        <Icon icon={item.icon} className="text-neon-pink" />
                      </div>
                      <div>
                        <div className="font-medium mb-0.5">{item.step}</div>
                        <p className="text-sm text-indigo-950/60">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
