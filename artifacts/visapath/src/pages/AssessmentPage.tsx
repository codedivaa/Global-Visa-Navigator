import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLocation } from 'wouter';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import CountrySelect from '@/components/CountrySelect';
import { saveAssessment } from '@/types';
import { ALL_COUNTRIES, DESTINATION_COUNTRIES } from '@/data/countries';
import { useAuth } from '@/contexts/AuthContext';
import { saveAssessmentToDb } from '@/lib/db';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

type Answers = {
  immigrationGoal: string;
  nationality: string;
  currentCountry: string;
  targetCountry: string;
  age: number;
  degree: string;
  fieldOfStudy: string;
  workExperience: number;
  englishScore: string;
  targetLanguageLevel: string;
  jobOffer: string;
  travelHistory: string[];
  specificAnswers: Record<string, string>;
};

// ── Small UI atoms ─────────────────────────────────────────────────────────────

function OptionBtn({ label, isSelected, onSelect, desc }: { label: string; isSelected: boolean; onSelect: () => void; desc?: string }) {
  return (
    <button type="button" onClick={onSelect}
      className={`option-btn w-full p-4 rounded-xl border-2 flex items-center justify-between text-left ${isSelected ? 'selected' : 'border-indigo-bloom/20 hover:border-indigo-bloom/50 hover:bg-white/70'}`}>
      <div>
        <span className={`font-medium ${isSelected ? 'text-neon-pink' : 'text-[#1a0f2e]'}`}>{label}</span>
        {desc && <div className="text-xs text-indigo-950/50 mt-0.5">{desc}</div>}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-neon-pink bg-neon-pink scale-110' : 'border-indigo-bloom/30'}`}>
        {isSelected && <Icon icon="lucide:check" className="text-white text-xs" />}
      </div>
    </button>
  );
}

function TravelBtn({ region, isSelected, onToggle }: { region: string; isSelected: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`option-btn w-full p-4 rounded-xl border-2 flex items-center justify-between text-left ${isSelected ? 'selected' : 'border-indigo-bloom/20 hover:border-indigo-bloom/50 hover:bg-white/70'}`}>
      <span className={`font-medium ${isSelected ? 'text-neon-pink' : 'text-[#1a0f2e]'}`}>{region}</span>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-neon-pink bg-neon-pink scale-110' : 'border-indigo-bloom/30'}`}>
        {isSelected && <Icon icon="lucide:check" className="text-white text-xs" />}
      </div>
    </button>
  );
}

function GoalCard({ icon, label, desc, isSelected, onSelect }: { icon: string; label: string; desc: string; isSelected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      className={`option-btn p-5 rounded-xl border-2 flex flex-col items-start gap-3 text-left transition-all ${isSelected ? 'selected' : 'border-indigo-bloom/20 hover:border-indigo-bloom/50 hover:bg-white/70'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-neon-pink text-white shadow-[0_0_12px_rgba(244,34,114,0.4)]' : 'bg-indigo-bloom/8 text-indigo-bloom'}`}>
        <Icon icon={icon} className="text-xl" />
      </div>
      <div>
        <div className={`font-semibold text-sm ${isSelected ? 'text-neon-pink' : 'text-[#1a0f2e]'}`}>{label}</div>
        <div className="text-xs text-indigo-950/50 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </button>
  );
}

// ── Country-specific language options ──────────────────────────────────────────
const LANG_OPTIONS: Record<string, { label: string; opts: string[] }> = {
  'japan':       { label: 'Japanese (JLPT)', opts: ['JLPT N1', 'JLPT N2', 'JLPT N3', 'JLPT N4', 'JLPT N5', 'No Japanese'] },
  'south korea': { label: 'Korean (TOPIK)', opts: ['TOPIK 6', 'TOPIK 5', 'TOPIK 4', 'TOPIK 3', 'TOPIK 2', 'TOPIK 1', 'No Korean'] },
  'germany':     { label: 'German (Goethe / CEFR)', opts: ['C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'No German'] },
  'austria':     { label: 'German (CEFR)', opts: ['C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'No German'] },
  'switzerland': { label: 'German / French (CEFR)', opts: ['C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'No German/French'] },
  'france':      { label: 'French (DELF / DALF)', opts: ['C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'No French'] },
  'canada':      { label: 'IELTS / CELPIP Band', opts: ['CLB 10+ / IELTS 8+', 'CLB 9 / IELTS 7', 'CLB 8 / IELTS 6.5', 'CLB 7 / IELTS 6', 'CLB 5-6 / IELTS 5-5.5', 'Not yet tested'] },
  'uk':          { label: 'IELTS UKVI Score', opts: ['IELTS 8+', 'IELTS 7 / B2', 'IELTS 6 / B1', 'IELTS 5 / A2', 'Not yet tested'] },
};

// ── Country-specific deep questions (step 9) ──────────────────────────────────
const COUNTRY_QUESTIONS: Record<string, Array<{ id: string; question: string; options: string[] }>> = {
  'Japan': [
    { id: 'jp_sponsor', question: 'Do you have a Japanese employer willing to sponsor your visa?', options: ['Yes — job offer confirmed', 'In active negotiations', 'No sponsor yet', 'Self-employed / Startup'] },
    { id: 'jp_field', question: "Does your degree or experience match your intended work in Japan?", options: ['Yes — IT / Engineering / Tech', 'Yes — Humanities / Business / Finance', 'Yes — Research / Academia / Medicine', 'Partial match', 'No match / Unsure'] },
  ],
  'South Korea': [
    { id: 'sk_sponsor', question: 'What is your employment situation for South Korea?', options: ['Job offer from a Korean company', 'In active job negotiations', 'Looking for work (job seeker)', 'Self-employed / Startup plan'] },
    { id: 'sk_sector', question: 'Which occupation category best describes you?', options: ['IT / Software / Technology', 'Engineering / Manufacturing', 'Finance / Business / Management', 'Healthcare / Medical', 'Education / Research', 'Other professional'] },
  ],
  'Germany': [
    { id: 'de_degree', question: 'Has your foreign degree been officially recognised in Germany?', options: ['Yes — fully recognised (anabin/KMK)', 'In the recognition process', 'Not yet applied', 'No — planning to get assessed'] },
    { id: 'de_employer', question: 'Do you have a job offer from a German employer?', options: ['Yes — confirmed offer above minimum salary', 'Yes — offer below sectoral minimum', 'No — using Opportunity Card to search', 'No — considering self-employment'] },
  ],
  'Canada': [
    { id: 'ca_province', question: 'Do you have a connection to a specific Canadian province?', options: ['Yes — strong ties (job offer / family)', 'Yes — general preference', 'Open to any province', 'No specific preference'] },
    { id: 'ca_french', question: 'Do you have French language ability?', options: ['Yes — fluent / advanced (NCLC 7+)', 'Yes — intermediate (B1/B2)', 'Basic French only', 'No French'] },
  ],
  'USA': [
    { id: 'us_sponsor', question: 'Is a US employer willing to file an H-1B or other visa petition for you?', options: ['Yes — confirmed employer sponsor', 'Currently negotiating', 'No sponsor yet', 'Self-employed / investor pathway'] },
    { id: 'us_stem', question: 'Is your field STEM (eligible for OPT extension / EB-2 NIW)?', options: ['Yes — Computer Science / IT / Data', 'Yes — Engineering / Sciences', 'Yes — Maths / Statistics / Research', 'No — Business / Arts / Humanities', 'Unsure'] },
  ],
  'Australia': [
    { id: 'au_skills', question: 'Have you completed an Australian skills assessment?', options: ['Yes — positive outcome', 'Applied / awaiting result', 'Not yet applied', 'No — not sure if required'] },
    { id: 'au_state', question: 'Are you interested in state / territory nomination?', options: ['Yes — specific state in mind', 'Open to any state', 'Prefer no nomination (independent)', 'Unsure'] },
  ],
  'UK': [
    { id: 'uk_cos', question: 'Do you have a UK employer with a Skilled Worker sponsor licence?', options: ['Yes — Certificate of Sponsorship offered', 'Employer is applying for licence', 'No sponsor yet', 'Pursuing Global Talent / Graduate route'] },
    { id: 'uk_salary', question: 'Does your expected UK role meet the salary threshold?', options: ['Yes — above £38,700 (standard)', 'Yes — above £25,600 (shortage occupation)', 'Unsure of salary', 'Below threshold'] },
  ],
  'Singapore': [
    { id: 'sg_salary', question: 'What is your expected monthly salary in Singapore (SGD)?', options: ['SGD 10,000+', 'SGD 6,000 – 9,999', 'SGD 4,500 – 5,999 (min. EP threshold)', 'Below SGD 4,500', 'Unsure'] },
    { id: 'sg_sector', question: 'Which sector will you work in?', options: ['Technology / Engineering / Data', 'Finance / Banking', 'Healthcare / Life Sciences', 'Business / Management', 'Creative / Media', 'Other'] },
  ],
  'France': [
    { id: 'fr_talent', question: 'What type of talent pathway applies to you?', options: ['Tech / Digital / Startup (French Tech)', 'Scientific Research', 'Artistic / Cultural creation', 'Business investor / founder', 'Qualified employee (employer offer)', 'Unsure'] },
    { id: 'fr_employer', question: 'Do you have a job offer or business plan for France?', options: ['Yes — employer offer confirmed', 'Yes — founding a company in France', 'No — applying as exceptional talent', 'No offer yet'] },
  ],
  'Netherlands': [
    { id: 'nl_salary', question: 'Is your expected Dutch salary above the Highly Skilled Migrant threshold?', options: ['Yes — above €63,894/year (under 30)', 'Yes — above €46,107/year (30+)', 'Unsure', 'Below threshold'] },
    { id: 'nl_employer', question: 'What type of employer do you have?', options: ['IND-recognised sponsor (multinational)', 'Dutch startup / SME', 'Self-employment / Freelance', 'No employer yet'] },
  ],
  'Ireland': [
    { id: 'ie_critical', question: "Is your occupation on Ireland's Critical Skills Eligible Occupations list?", options: ['Yes — confirmed', 'Possibly — need to check', 'No — applying as General Employment Permit', 'Unsure'] },
    { id: 'ie_salary', question: 'Does your Irish job offer meet the salary requirement?', options: ['Yes — above €38,000 (Critical Skills)', 'Yes — above €30,000 (Highly Regulated)', 'Below €30,000', 'No offer yet'] },
  ],
  'New Zealand': [
    { id: 'nz_skills', question: 'Have you had your qualifications assessed for New Zealand?', options: ['Yes — positive NZ skills assessment', 'Applied / in process', 'Not yet started', 'Not required for my role'] },
    { id: 'nz_age', question: 'What is your age bracket?', options: ['Under 26', '26 – 30', '31 – 35', '36 – 40', '41 – 45', 'Over 45'] },
  ],
  'Sweden': [
    { id: 'se_employer', question: 'Do you have a Swedish employer offering a position?', options: ['Yes — written offer confirmed', 'In negotiations', 'No offer yet', 'Self-employed plan'] },
    { id: 'se_salary', question: 'Does your offer meet the collective agreement minimum salary?', options: ['Yes — above sectoral minimum', 'Unsure of minimum', 'Offer below minimum', 'No offer yet'] },
  ],
  'Norway': [
    { id: 'no_employer', question: 'Do you have a Norwegian employer?', options: ['Yes — confirmed job offer', 'In negotiations', 'No offer yet', 'Self-employed / investor'] },
    { id: 'no_salary', question: 'Does your expected salary meet Norwegian standards?', options: ['Yes — above industry minimum', 'Comparable to market rate', 'Unsure', 'No offer yet'] },
  ],
  'Switzerland': [
    { id: 'ch_employer', question: 'Do you have a Swiss employer?', options: ['Yes — confirmed job offer', 'In process', 'No offer yet'] },
    { id: 'ch_priority', question: 'Have EU/EEA workers been considered for the role first?', options: ['Yes — employer confirmed EU priority check done', 'Employer is handling this', 'Unsure', 'Not yet at that stage'] },
  ],
};

const DEFAULT_QUESTIONS = [
  { id: 'gen_lang', question: 'What is your proficiency in the official language of your target country?', options: ['Fluent / Native level', 'Advanced (B2+)', 'Intermediate (B1)', 'Basic only', 'No knowledge'] },
  { id: 'gen_record', question: 'Do you have a clean criminal record for all countries lived in?', options: ['Yes — clean record', 'Minor offences only (disclosed)', 'Unsure about requirements', 'Have prior issues to disclose'] },
];

const TOTAL_STEPS = 10;

export default function AssessmentPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [answers, setAnswers] = useState<Answers>({
    immigrationGoal: '',
    nationality: '',
    currentCountry: '',
    targetCountry: '',
    age: 28,
    degree: '',
    fieldOfStudy: '',
    workExperience: 3,
    englishScore: '',
    targetLanguageLevel: '',
    jobOffer: '',
    travelHistory: [],
    specificAnswers: {},
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const offset = 175.9 - (175.9 * progress / 100);

  const titles = [
    'Immigration Goal',
    'Identity & Nationality',
    'Current Residency',
    'Destination Country',
    'Academic Background',
    'Work Experience',
    'Language Skills',
    'Employment Status',
    'Personalized Questions',
    'Travel History',
  ];

  const setField = <K extends keyof Answers>(field: K, value: Answers[K]) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const setSpecific = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, specificAnswers: { ...prev.specificAnswers, [key]: value } }));
  };

  const toggleTravel = (val: string) => {
    setAnswers(prev => ({
      ...prev,
      travelHistory: prev.travelHistory.includes(val)
        ? prev.travelHistory.filter(i => i !== val)
        : [...prev.travelHistory, val],
    }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(s => s + 1);
    } else {
      saveAssessment(answers);
      if (user) {
        saveAssessmentToDb(user.id, answers).then(id => {
          if (id) localStorage.setItem('visapath_assessment_id', id);
        });
      }
      navigate('/results');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const [aiQuestions, setAiQuestions] = useState<Array<{ id: string; question: string; options: string[] }> | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    if (currentStep !== 9) return;
    if (!answers.targetCountry || !answers.immigrationGoal) return;
    let cancelled = false;
    setAiQuestions(null);
    setQuestionsLoading(true);
    fetch(`${BASE}/api/ai/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nationality: answers.nationality,
        currentCountry: answers.currentCountry,
        targetCountry: answers.targetCountry,
        immigrationGoal: answers.immigrationGoal,
      }),
    })
      .then(r => r.json())
      .then(data => { if (!cancelled && Array.isArray(data.questions)) setAiQuestions(data.questions); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setQuestionsLoading(false); });
    return () => { cancelled = true; };
  }, [currentStep, answers.targetCountry, answers.immigrationGoal]);

  const targetLower = answers.targetCountry.toLowerCase();
  const langConfig = LANG_OPTIONS[targetLower];
  const countryQuestions = COUNTRY_QUESTIONS[answers.targetCountry] ?? DEFAULT_QUESTIONS;
  const displayQuestions = aiQuestions ?? countryQuestions;

  const needsLanguageStep = !!langConfig;

  const allDestinations = [
    ...DESTINATION_COUNTRIES,
    ...ALL_COUNTRIES.filter(c => !DESTINATION_COUNTRIES.find(d => d.value === c.value)),
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <AnimatedBackground />
      <NavBar activeItem="assessment" />

      <main className="relative z-10 flex-1 flex flex-col items-center pt-40 px-6 pb-20">
        {/* Progress */}
        <div className="w-full max-w-3xl flex flex-col items-center mb-12">
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#cbcbf6" strokeWidth="4" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="#601b9d" strokeWidth="4" fill="transparent"
                  strokeDasharray="175.9" strokeDashoffset={offset} strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px #f42272)', transition: 'stroke-dashoffset 0.5s ease' }} />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest mb-1">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <h2 className="font-space text-lg font-bold">{titles[currentStep - 1]}</h2>
            </div>
          </div>
          <div className="w-full h-1.5 bg-periwinkle rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-bloom to-neon-pink transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step card */}
        <div className="w-full max-w-2xl glass-card p-10 relative overflow-visible" ref={containerRef}>

          {/* ── Step 1: Immigration Goal ───────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Why are you immigrating?</h1>
                <p className="text-[#4b3b6b] text-lg">Your primary goal shapes every visa recommendation we make.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: 'lucide:graduation-cap', label: 'Study', desc: 'Higher education, student visa, degree abroad', value: 'Study' },
                  { icon: 'lucide:briefcase', label: 'Work', desc: 'Employed by a local or foreign company', value: 'Work' },
                  { icon: 'lucide:star', label: 'Skilled Migration', desc: 'Points-based systems & independent pathways', value: 'Skilled Migration' },
                  { icon: 'lucide:rocket', label: 'Startup / Business', desc: 'Launch or transfer a business abroad', value: 'Startup / Business' },
                  { icon: 'lucide:home', label: 'Permanent Residency', desc: 'Settle long-term with full PR status', value: 'Permanent Residency' },
                  { icon: 'lucide:users', label: 'Family Sponsorship', desc: 'Join a spouse, parent, or child abroad', value: 'Family Sponsorship' },
                ].map(g => (
                  <GoalCard key={g.value} icon={g.icon} label={g.label} desc={g.desc}
                    isSelected={answers.immigrationGoal === g.value}
                    onSelect={() => setField('immigrationGoal', g.value)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Nationality + Age ─────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Identity & Nationality</h1>
                <p className="text-[#4b3b6b] text-lg">Your citizenship and age are core eligibility factors for every visa.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-indigo-bloom mb-2 block">Country of Citizenship / Nationality</label>
                  <CountrySelect value={answers.nationality} onChange={v => setField('nationality', v)}
                    countries={ALL_COUNTRIES} placeholder="Search your nationality…" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-xs font-mono uppercase tracking-widest text-indigo-bloom">Your Age</label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-space font-bold text-indigo-bloom">{answers.age}</span>
                      <span className="text-sm font-mono text-indigo-bloom/50">years old</span>
                    </div>
                  </div>
                  <input type="range" min="18" max="65" value={answers.age}
                    onChange={e => setField('age', parseInt(e.target.value))}
                    className="w-full accent-neon-pink" />
                  <div className="flex justify-between text-xs font-mono text-indigo-bloom/40 mt-1">
                    <span>18</span><span>30</span><span>40</span><span>50</span><span>65</span>
                  </div>
                  {answers.age >= 25 && answers.age <= 32 && (
                    <div className="mt-2 text-xs text-green-600 font-mono flex items-center gap-1">
                      <Icon icon="lucide:check-circle" /> Optimal age range for most points-based immigration systems
                    </div>
                  )}
                  {answers.age > 44 && (
                    <div className="mt-2 text-xs text-amber-600 font-mono flex items-center gap-1">
                      <Icon icon="lucide:alert-triangle" /> Some countries (Australia, NZ) have age limits — we will highlight those
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Current Country ───────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Where do you live currently?</h1>
                <p className="text-[#4b3b6b] text-lg">Your current country determines which embassy processes your application and typical processing times.</p>
              </div>
              <CountrySelect value={answers.currentCountry} onChange={v => setField('currentCountry', v)}
                countries={ALL_COUNTRIES} placeholder="Search your current country of residence…" />
            </div>
          )}

          {/* ── Step 4: Target Country ────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Where do you want to immigrate?</h1>
                <p className="text-[#4b3b6b] text-lg">Your target country is shown first in all recommendations. Popular destinations appear at the top.</p>
              </div>
              <CountrySelect value={answers.targetCountry} onChange={v => { setField('targetCountry', v); setField('targetLanguageLevel', ''); }}
                countries={allDestinations} placeholder="Search destination country…" />
              {answers.targetCountry && (
                <div className="p-4 bg-indigo-bloom/5 rounded-xl border border-indigo-bloom/15 text-sm text-indigo-950/70">
                  <div className="flex items-center gap-2 font-semibold text-indigo-bloom mb-1">
                    <Icon icon="lucide:info" className="text-sm" />
                    Questions ahead are tailored to {answers.targetCountry}
                  </div>
                  We will ask {answers.targetCountry}-specific language, employment, and eligibility questions.
                </div>
              )}
            </div>
          )}

          {/* ── Step 5: Education ─────────────────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Academic Background</h1>
                <p className="text-[#4b3b6b] text-lg">Education level and field of study are among the strongest signals in points-based visa systems.</p>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-indigo-bloom mb-3 block">Highest Level of Education</label>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'High School / Secondary Education', value: 'High School' },
                    { label: "Bachelor's Degree", value: "Bachelor's" },
                    { label: "Master's Degree", value: "Master's" },
                    { label: 'Doctorate / PhD', value: 'PhD' },
                  ].map(opt => (
                    <OptionBtn key={opt.value} label={opt.label}
                      isSelected={answers.degree === opt.value} onSelect={() => setField('degree', opt.value)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-indigo-bloom mb-3 block">Field of Study</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: '💻 Computer Science / IT', value: 'Computer Science' },
                    { label: '⚙️ Engineering', value: 'Engineering' },
                    { label: '📊 Data Science / AI', value: 'Data Science' },
                    { label: '🩺 Medicine / Healthcare', value: 'Medicine' },
                    { label: '💰 Business / Finance', value: 'Business' },
                    { label: '⚖️ Law', value: 'Law' },
                    { label: '🎨 Arts / Humanities', value: 'Arts' },
                    { label: '🔬 Natural Sciences', value: 'Sciences' },
                    { label: '📚 Education / Teaching', value: 'Education' },
                    { label: '🌐 Other / Interdisciplinary', value: 'Other' },
                  ].map(opt => (
                    <OptionBtn key={opt.value} label={opt.label}
                      isSelected={answers.fieldOfStudy === opt.value} onSelect={() => setField('fieldOfStudy', opt.value)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 6: Work Experience ───────────────────────────────────────── */}
          {currentStep === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Years of Work Experience</h1>
                <p className="text-[#4b3b6b] text-lg">Count only <strong>full-time professional experience</strong> after completing your studies. Do not include internships, volunteer work, or part-time roles.</p>
              </div>
              <div className="pt-6 pb-4">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-6xl font-space font-bold text-indigo-bloom">{answers.workExperience}</span>
                  <span className="text-sm font-mono text-indigo-bloom/60 uppercase mb-2">Full-time years</span>
                </div>
                <input type="range" min="0" max="20" value={answers.workExperience}
                  onChange={e => setField('workExperience', parseInt(e.target.value))}
                  className="w-full accent-neon-pink" />
                <div className="flex justify-between text-xs font-mono text-indigo-bloom/40 mt-2">
                  <span>0 yrs</span><span>5</span><span>10</span><span>15</span><span>20 yrs</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { range: '0–2 years', note: 'Junior', color: 'text-amber-600 bg-amber-50' },
                    { range: '3–6 years', note: 'Mid-level', color: 'text-indigo-600 bg-indigo-50' },
                    { range: '7+ years', note: 'Senior', color: 'text-green-700 bg-green-50' },
                  ].map(b => (
                    <div key={b.range} className={`p-2 rounded-lg border ${b.color} border-current/20`}>
                      <div className="font-semibold">{b.range}</div>
                      <div className="opacity-70">{b.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 7: Language Skills ───────────────────────────────────────── */}
          {currentStep === 7 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Language Skills</h1>
                <p className="text-[#4b3b6b] text-lg">Language proficiency is one of the most decisive factors for visa eligibility.</p>
              </div>

              {/* English */}
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-indigo-bloom mb-3 block">
                  English Proficiency
                  {targetLower === 'japan' || targetLower === 'south korea' || targetLower === 'germany' || targetLower === 'france' ? ' (IELTS / TOEFL / native)' : ' (IELTS / CELPIP / PTE)'}
                </label>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Basic (A1–A2)', desc: 'Can understand and use familiar everyday expressions', value: 'Basic' },
                    { label: 'Intermediate (B1–B2)', desc: 'IELTS 5.0–6.5 equivalent', value: 'Intermediate' },
                    { label: 'Advanced (C1–C2)', desc: 'IELTS 7.0+ equivalent', value: 'Advanced' },
                    { label: 'Native / Fluent', desc: 'Native speaker or equivalent mastery', value: 'Native/Fluent' },
                  ].map(opt => (
                    <OptionBtn key={opt.value} label={opt.label} desc={opt.desc}
                      isSelected={answers.englishScore === opt.value} onSelect={() => setField('englishScore', opt.value)} />
                  ))}
                </div>
              </div>

              {/* Country-specific language */}
              {langConfig && (
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-indigo-bloom mb-3 block flex items-center gap-2">
                    <Icon icon="lucide:star" className="text-neon-pink text-xs" />
                    {langConfig.label} — Required for {answers.targetCountry}
                  </label>
                  <div className="flex flex-col gap-3">
                    {langConfig.opts.map(opt => (
                      <OptionBtn key={opt} label={opt}
                        isSelected={answers.targetLanguageLevel === opt}
                        onSelect={() => setField('targetLanguageLevel', opt)} />
                    ))}
                  </div>
                </div>
              )}

              {!langConfig && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-3">
                  <Icon icon="lucide:check-circle" className="mt-0.5 flex-shrink-0" />
                  <span>{answers.targetCountry || 'Your target country'} primarily uses English as the language of immigration — your English score is the main language factor.</span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 8: Employment ────────────────────────────────────────────── */}
          {currentStep === 8 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Employment Status</h1>
                <p className="text-[#4b3b6b] text-lg">A job offer from a local employer is the single biggest eligibility multiplier for sponsored visa pathways.</p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: `Yes — confirmed offer in ${answers.targetCountry || 'target country'}`, desc: 'Written offer from a local employer who can sponsor', value: 'Yes - In Target Country' },
                  { label: 'Yes — remote / international role', desc: 'Will work for a foreign employer remotely', value: 'Yes - Remote' },
                  { label: 'No job offer yet', desc: 'Looking for work or using a job-search visa pathway', value: 'No' },
                ].map(opt => (
                  <OptionBtn key={opt.value} label={opt.label} desc={opt.desc}
                    isSelected={answers.jobOffer === opt.value} onSelect={() => setField('jobOffer', opt.value)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 9: Country-Specific Questions ────────────────────────────── */}
          {currentStep === 9 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="px-2 py-0.5 bg-neon-pink/10 text-neon-pink text-[10px] font-mono rounded-full uppercase tracking-widest">
                    {answers.targetCountry || 'Destination'}-specific
                  </div>
                  {aiQuestions && (
                    <div className="px-2 py-0.5 bg-indigo-bloom/8 text-indigo-bloom text-[10px] font-mono rounded-full uppercase tracking-widest flex items-center gap-1">
                      <Icon icon="lucide:sparkles" className="text-[10px]" /> AI Generated
                    </div>
                  )}
                </div>
                <h1 className="text-4xl font-space font-bold">Personalized Questions</h1>
                <p className="text-[#4b3b6b] text-lg">These questions are tailored specifically to your destination and immigration goal to sharpen your eligibility score.</p>
              </div>

              {questionsLoading ? (
                <div className="space-y-8">
                  {[1, 2].map(i => (
                    <div key={i} className="space-y-3 animate-pulse">
                      <div className="h-4 bg-indigo-bloom/10 rounded-lg w-4/5" />
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map(j => (
                          <div key={j} className="h-12 bg-indigo-bloom/6 rounded-xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs text-indigo-bloom/60 font-mono">
                    <Icon icon="lucide:sparkles" className="text-neon-pink animate-pulse" />
                    Generating personalised questions for {answers.targetCountry}…
                  </div>
                </div>
              ) : displayQuestions.map(q => (
                <div key={q.id}>
                  <label className="text-sm font-semibold text-[#1a0f2e] mb-3 block">{q.question}</label>
                  <div className="flex flex-col gap-2">
                    {q.options.map(opt => (
                      <OptionBtn key={opt} label={opt}
                        isSelected={answers.specificAnswers[q.id] === opt}
                        onSelect={() => setSpecific(q.id, opt)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Step 10: Travel History ───────────────────────────────────────── */}
          {currentStep === 10 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Travel History</h1>
                <p className="text-[#4b3b6b] text-lg">Select all regions you have visited or lived in over the last 10 years. Extensive travel history signals lower risk to visa officers.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['North America', 'Europe', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'].map(region => (
                  <TravelBtn key={region} region={region}
                    isSelected={answers.travelHistory.includes(region)}
                    onToggle={() => toggleTravel(region)} />
                ))}
              </div>
              {answers.travelHistory.length >= 3 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                  <Icon icon="lucide:check-circle" />
                  <span>Strong travel history — this positively impacts several visa systems</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="w-full max-w-2xl mt-12 flex justify-between items-center">
          <button type="button" onClick={handlePrev}
            className={`px-8 py-3 rounded-full border border-indigo-bloom/20 text-indigo-bloom hover:bg-indigo-bloom/5 active:scale-[0.96] active:bg-indigo-bloom/10 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
            <span className="flex items-center gap-2"><Icon icon="lucide:arrow-left" /> Previous</span>
          </button>
          <button type="button" onClick={handleNext} data-testid="button-next-step"
            className="px-10 py-4 rounded-full bg-neon-pink text-white font-bold hover:bg-pink-600 active:scale-[0.96] active:bg-pink-700 transition-all shadow-md hover:shadow-lg">
            {currentStep === TOTAL_STEPS ? 'View My Results' : 'Next Step'}
          </button>
        </div>
      </main>
    </div>
  );
}
