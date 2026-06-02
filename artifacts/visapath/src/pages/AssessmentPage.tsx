import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useLocation } from 'wouter';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { saveAssessment } from '@/types';

type Answers = {
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

type OptionBtnProps = {
  label: string;
  value: string;
  isSelected: boolean;
  onSelect: () => void;
};

function OptionBtn({ label, isSelected, onSelect }: OptionBtnProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`option-btn w-full p-4 rounded-xl border-2 flex items-center justify-between text-left ${
        isSelected ? 'selected' : 'border-indigo-bloom/20 hover:border-indigo-bloom/50 hover:bg-white/70'
      }`}
    >
      <span className={`font-medium ${isSelected ? 'text-neon-pink' : 'text-[#1a0f2e]'}`}>
        {label}
      </span>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected ? 'border-neon-pink bg-neon-pink scale-110' : 'border-indigo-bloom/30'
        }`}
      >
        {isSelected && <Icon icon="lucide:check" className="text-white text-xs" />}
      </div>
    </button>
  );
}

type TravelBtnProps = {
  region: string;
  isSelected: boolean;
  onToggle: () => void;
};

function TravelBtn({ region, isSelected, onToggle }: TravelBtnProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`option-btn w-full p-4 rounded-xl border-2 flex items-center justify-between text-left ${
        isSelected ? 'selected' : 'border-indigo-bloom/20 hover:border-indigo-bloom/50 hover:bg-white/70'
      }`}
    >
      <span className={`font-medium ${isSelected ? 'text-neon-pink' : 'text-[#1a0f2e]'}`}>
        {region}
      </span>
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected ? 'border-neon-pink bg-neon-pink scale-110' : 'border-indigo-bloom/30'
        }`}
      >
        {isSelected && <Icon icon="lucide:check" className="text-white text-xs" />}
      </div>
    </button>
  );
}

export default function AssessmentPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const containerRef = useRef<HTMLDivElement>(null);

  const [answers, setAnswers] = useState<Answers>({
    nationality: '',
    currentCountry: '',
    targetCountry: '',
    age: 28,
    degree: '',
    workExperience: 5,
    englishScore: '',
    jobOffer: '',
    travelHistory: [],
  });

  const progress = (currentStep / totalSteps) * 100;
  const offset = 175.9 - (175.9 * progress / 100);

  const titles = [
    'Identity & Origin',
    'Residency',
    'Destination',
    'Academic Background',
    'Work Experience',
    'Language Skills',
    'Employment',
    'Travel History',
  ];

  const setField = (field: keyof Answers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
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
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
    } else {
      saveAssessment(answers);
      navigate('/results');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

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
                <circle
                  cx="32" cy="32" r="28"
                  stroke="#601b9d" strokeWidth="4" fill="transparent"
                  strokeDasharray="175.9"
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px #f42272)', transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest mb-1">
                Step {currentStep} of {totalSteps}
              </span>
              <h2 className="font-space text-lg font-bold">{titles[currentStep - 1]}</h2>
            </div>
          </div>
          <div className="w-full h-1.5 bg-periwinkle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-bloom to-neon-pink transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step cards */}
        <div className="w-full max-w-2xl glass-card p-10 relative overflow-hidden" ref={containerRef}>

          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">What is your nationality?</h1>
                <p className="text-[#4b3b6b] text-lg">Your country of citizenship defines your core visa eligibility rules.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: '🇮🇳 India', value: 'India' },
                  { label: '🇨🇳 China', value: 'China' },
                  { label: '🇳🇬 Nigeria', value: 'Nigeria' },
                  { label: '🇵🇭 Philippines', value: 'Philippines' },
                  { label: '🇲🇽 Mexico', value: 'Mexico' },
                  { label: '🌐 Other', value: 'Other' },
                ].map(opt => (
                  <OptionBtn key={opt.value} label={opt.label} value={opt.value}
                    isSelected={answers.nationality === opt.value}
                    onSelect={() => setField('nationality', opt.value)} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Where do you live currently?</h1>
                <p className="text-[#4b3b6b] text-lg">Current residency affects processing centers and wait times.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: '🇺🇸 United States', value: 'USA' },
                  { label: '🇬🇧 United Kingdom', value: 'UK' },
                  { label: '🇮🇳 India', value: 'India' },
                  { label: '🇨🇦 Canada', value: 'Canada' },
                  { label: '🇦🇺 Australia', value: 'Australia' },
                  { label: '🌐 Other', value: 'Other' },
                ].map(opt => (
                  <OptionBtn key={opt.value} label={opt.label} value={opt.value}
                    isSelected={answers.currentCountry === opt.value}
                    onSelect={() => setField('currentCountry', opt.value)} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">What is your target destination?</h1>
                <p className="text-[#4b3b6b] text-lg">Where are you looking to immigrate to?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: '🇨🇦 Canada', value: 'Canada' },
                  { label: '🇩🇪 Germany', value: 'Germany' },
                  { label: '🇺🇸 USA', value: 'USA' },
                  { label: '🇬🇧 UK', value: 'UK' },
                  { label: '🇦🇺 Australia', value: 'Australia' },
                  { label: '🇯🇵 Japan', value: 'Japan' },
                ].map(opt => (
                  <OptionBtn key={opt.value} label={opt.label} value={opt.value}
                    isSelected={answers.targetCountry === opt.value}
                    onSelect={() => setField('targetCountry', opt.value)} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Highest level of education?</h1>
                <p className="text-[#4b3b6b] text-lg">Education is heavily weighted in points-based systems.</p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'High School / Secondary', value: 'High School' },
                  { label: "Bachelor's Degree", value: "Bachelor's" },
                  { label: "Master's Degree", value: "Master's" },
                  { label: 'Doctorate / PhD', value: 'PhD' },
                ].map(opt => (
                  <OptionBtn key={opt.value} label={opt.label} value={opt.value}
                    isSelected={answers.degree === opt.value}
                    onSelect={() => setField('degree', opt.value)} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Years of work experience?</h1>
                <p className="text-[#4b3b6b] text-lg">Skilled professional experience post-graduation.</p>
              </div>
              <div className="pt-10 pb-4">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-6xl font-space font-bold text-indigo-bloom">{answers.workExperience}</span>
                  <span className="text-sm font-mono text-indigo-bloom/60 uppercase mb-2">Years</span>
                </div>
                <input
                  type="range" min="0" max="20"
                  value={answers.workExperience}
                  onChange={e => setAnswers(prev => ({ ...prev, workExperience: parseInt(e.target.value) }))}
                  className="w-full accent-neon-pink"
                />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">English proficiency level?</h1>
                <p className="text-[#4b3b6b] text-lg">Based on standard tests like IELTS or TOEFL.</p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Basic (A1-A2)', value: 'Basic' },
                  { label: 'Intermediate (B1-B2)', value: 'Intermediate' },
                  { label: 'Advanced (C1-C2)', value: 'Advanced' },
                  { label: 'Native / Fluent', value: 'Native/Fluent' },
                ].map(opt => (
                  <OptionBtn key={opt.value} label={opt.label} value={opt.value}
                    isSelected={answers.englishScore === opt.value}
                    onSelect={() => setField('englishScore', opt.value)} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Do you have a job offer?</h1>
                <p className="text-[#4b3b6b] text-lg">A valid job offer significantly increases chances.</p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Yes, in target country', value: 'Yes - In Target Country' },
                  { label: 'Yes, remote', value: 'Yes - Remote' },
                  { label: 'No job offer yet', value: 'No' },
                ].map(opt => (
                  <OptionBtn key={opt.value} label={opt.label} value={opt.value}
                    isSelected={answers.jobOffer === opt.value}
                    onSelect={() => setField('jobOffer', opt.value)} />
                ))}
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Travel History</h1>
                <p className="text-[#4b3b6b] text-lg">Select all regions you have visited in the last 10 years.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['North America', 'Europe', 'Asia-Pacific', 'Middle East', 'Others'].map(region => (
                  <TravelBtn key={region} region={region}
                    isSelected={answers.travelHistory.includes(region)}
                    onToggle={() => toggleTravel(region)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="w-full max-w-2xl mt-12 flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrev}
            className={`px-8 py-3 rounded-full border border-indigo-bloom/20 text-indigo-bloom hover:bg-indigo-bloom/5 active:scale-[0.96] active:bg-indigo-bloom/10 transition-all ${
              currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <span className="flex items-center gap-2"><Icon icon="lucide:arrow-left" /> Previous</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            data-testid="button-next-step"
            className="px-10 py-4 rounded-full bg-neon-pink text-white font-bold hover:bg-pink-600 active:scale-[0.96] active:bg-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            {currentStep === totalSteps ? 'View Results' : 'Next Step'}
          </button>
        </div>
      </main>
    </div>
  );
}
