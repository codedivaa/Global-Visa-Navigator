import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { saveAssessment } from '@/types';

export default function AssessmentPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [answers, setAnswers] = useState({
    nationality: '',
    currentCountry: '',
    targetCountry: '',
    age: 28,
    degree: '',
    workExperience: 5,
    englishScore: '',
    jobOffer: '',
    travelHistory: [] as string[]
  });

  const progress = (currentStep / totalSteps) * 100;
  const offset = 175.9 - (175.9 * progress / 100);

  const titles = [
    "Identity & Origin",
    "Residency",
    "Destination",
    "Academic Background",
    "Work Experience",
    "Language Skills",
    "Employment",
    "Travel History"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
    } else {
      saveAssessment(answers);
      navigate('/results');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    }
  };

  const toggleTravel = (val: string) => {
    setAnswers(prev => ({
      ...prev,
      travelHistory: prev.travelHistory.includes(val)
        ? prev.travelHistory.filter(i => i !== val)
        : [...prev.travelHistory, val]
    }));
  };

  const OptionBtn = ({ label, value, field }: { label: string, value: string, field: keyof typeof answers }) => {
    const isSelected = answers[field] === value;
    return (
      <button 
        onClick={() => setAnswers(prev => ({ ...prev, [field]: value }))}
        className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group text-left ${isSelected ? 'border-neon-pink bg-neon-pink/5' : 'border-indigo-bloom/20 hover:border-indigo-bloom/50 hover:bg-white'}`}
      >
        <span className={`font-medium ${isSelected ? 'text-neon-pink' : 'text-text-main'}`}>{label}</span>
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-neon-pink bg-neon-pink' : 'border-indigo-bloom/30'}`}>
          {isSelected && <Icon icon="lucide:check" className="text-white text-xs" />}
        </div>
      </button>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <AnimatedBackground />
      <NavBar activeItem="assessment" />

      <main className="relative z-10 flex-1 flex flex-col items-center pt-40 px-6 pb-20">
        <div className="w-full max-w-3xl flex flex-col items-center mb-12">
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#cbcbf6" strokeWidth="4" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="#601b9d" strokeWidth="4" fill="transparent" strokeDasharray="175.9" strokeDashoffset={offset} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #f42272)', transition: 'stroke-dashoffset 0.5s ease' }} />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest mb-1">Step {currentStep} of {totalSteps}</span>
              <h2 className="font-space text-lg font-bold">{titles[currentStep - 1]}</h2>
            </div>
          </div>
          <div className="w-full h-1.5 bg-periwinkle rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-bloom to-neon-pink transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="w-full max-w-2xl glass-card p-10 relative overflow-hidden" ref={containerRef}>
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">What is your nationality?</h1>
                <p className="text-[#4b3b6b] text-lg">Your country of citizenship defines your core visa eligibility rules.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OptionBtn label="🇮🇳 India" value="India" field="nationality" />
                <OptionBtn label="🇨🇳 China" value="China" field="nationality" />
                <OptionBtn label="🇳🇬 Nigeria" value="Nigeria" field="nationality" />
                <OptionBtn label="🇵🇭 Philippines" value="Philippines" field="nationality" />
                <OptionBtn label="🇲🇽 Mexico" value="Mexico" field="nationality" />
                <OptionBtn label="🌐 Other" value="Other" field="nationality" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Where do you live currently?</h1>
                <p className="text-[#4b3b6b] text-lg">Current residency affects processing centers and wait times.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OptionBtn label="🇺🇸 United States" value="USA" field="currentCountry" />
                <OptionBtn label="🇬🇧 United Kingdom" value="UK" field="currentCountry" />
                <OptionBtn label="🇮🇳 India" value="India" field="currentCountry" />
                <OptionBtn label="🇨🇦 Canada" value="Canada" field="currentCountry" />
                <OptionBtn label="🇦🇺 Australia" value="Australia" field="currentCountry" />
                <OptionBtn label="🌐 Other" value="Other" field="currentCountry" />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">What is your target destination?</h1>
                <p className="text-[#4b3b6b] text-lg">Where are you looking to immigrate to?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OptionBtn label="🇨🇦 Canada" value="Canada" field="targetCountry" />
                <OptionBtn label="🇩🇪 Germany" value="Germany" field="targetCountry" />
                <OptionBtn label="🇺🇸 USA" value="USA" field="targetCountry" />
                <OptionBtn label="🇬🇧 UK" value="UK" field="targetCountry" />
                <OptionBtn label="🇦🇺 Australia" value="Australia" field="targetCountry" />
                <OptionBtn label="🇯🇵 Japan" value="Japan" field="targetCountry" />
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
                <OptionBtn label="High School / Secondary" value="High School" field="degree" />
                <OptionBtn label="Bachelor's Degree" value="Bachelor's" field="degree" />
                <OptionBtn label="Master's Degree" value="Master's" field="degree" />
                <OptionBtn label="Doctorate / PhD" value="PhD" field="degree" />
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
                  type="range" 
                  min="0" max="20" 
                  value={answers.workExperience}
                  onChange={(e) => setAnswers(prev => ({...prev, workExperience: parseInt(e.target.value)}))}
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
                <OptionBtn label="Basic (A1-A2)" value="Basic" field="englishScore" />
                <OptionBtn label="Intermediate (B1-B2)" value="Intermediate" field="englishScore" />
                <OptionBtn label="Advanced (C1-C2)" value="Advanced" field="englishScore" />
                <OptionBtn label="Native / Fluent" value="Native/Fluent" field="englishScore" />
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
                <OptionBtn label="Yes, in target country" value="Yes - In Target Country" field="jobOffer" />
                <OptionBtn label="Yes, remote" value="Yes - Remote" field="jobOffer" />
                <OptionBtn label="No job offer yet" value="No" field="jobOffer" />
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-4xl font-space font-bold">Travel History</h1>
                <p className="text-[#4b3b6b] text-lg">Select regions you have visited in the last 10 years.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['North America', 'Europe', 'Asia-Pacific', 'Middle East', 'Others'].map(region => {
                  const isSelected = answers.travelHistory.includes(region);
                  return (
                    <button 
                      key={region}
                      onClick={() => toggleTravel(region)}
                      className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group text-left ${isSelected ? 'border-neon-pink bg-neon-pink/5' : 'border-indigo-bloom/20 hover:border-indigo-bloom/50 hover:bg-white'}`}
                    >
                      <span className={`font-medium ${isSelected ? 'text-neon-pink' : 'text-text-main'}`}>{region}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'border-neon-pink bg-neon-pink' : 'border-indigo-bloom/30'}`}>
                        {isSelected && <Icon icon="lucide:check" className="text-white text-xs" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        <div className="w-full max-w-2xl mt-12 flex justify-between items-center">
          <button 
            onClick={handlePrev} 
            className={`px-8 py-3 rounded-full border border-indigo-bloom/20 text-indigo-bloom hover:bg-indigo-bloom/5 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <span className="flex items-center gap-2"><Icon icon="lucide:arrow-left" /> Previous</span>
          </button>
          <button 
            onClick={handleNext}
            data-testid="button-next-step"
            className="px-10 py-4 rounded-full bg-neon-pink text-white font-bold hover:scale-105 transition-all"
          >
            {currentStep === totalSteps ? 'View Results' : 'Next Step'}
          </button>
        </div>
      </main>
    </div>
  );
}