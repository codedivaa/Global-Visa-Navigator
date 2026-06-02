import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'wouter';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { loadAssessment } from '@/types';
import { calculateScores, type ScoringResult } from '@/lib/scoring';

export default function ResultsPage() {
  const [, navigate] = useLocation();
  const [results, setResults] = useState<ScoringResult | null>(null);

  useEffect(() => {
    const data = loadAssessment();
    if (!data) {
      navigate('/assessment');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setResults(calculateScores(data as any));
  }, [navigate]);

  if (!results) return null;

  const offset = 452 - (452 * results.overallScore / 100);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <AnimatedBackground />
      <NavBar activeItem="results" />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto pt-32 px-6 pb-20">
        <div className="text-center mb-16">
          <h1 className="font-space text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text-animate">Immigration Intelligence Report</span>
          </h1>
          <p className="text-xl text-indigo-950/70">Based on your assessment, here are your personalized pathways.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-card p-10 flex flex-col items-center text-center">
              <div className="text-sm font-mono text-indigo-bloom/70 uppercase tracking-widest mb-6">Overall Eligibility Score</div>
              <div className="relative flex flex-col items-center justify-center mb-6">
                 <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-indigo-bloom/10" />
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neon-pink" strokeDasharray="502" strokeDashoffset={offset} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #f42272)', transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-space font-bold">{results.overallScore}%</span>
                </div>
              </div>
              <div className="bg-neon-pink/10 text-neon-pink px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-sm mb-2">{results.overallCategory}</div>
              <p className="text-indigo-950/60 text-sm">Your profile aligns well with points-based systems.</p>
            </div>

            <Link href="/advisor" className="light-beam-btn w-full py-5 text-lg font-semibold group flex items-center justify-center gap-3">
              <div className="beam-border animate-border-spin"></div>
              <Icon icon="lucide:message-square" />
              Chat with AI Advisor
            </Link>
            
            <Link href="/assessment" className="w-full py-4 text-center text-indigo-bloom hover:bg-white/50 rounded-full border border-indigo-bloom/20 transition-all font-medium">
              Retake Assessment
            </Link>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-2xl font-space font-bold text-[#1a0f2e]">Top Visa Matches</h2>
            
            <div className="flex flex-col gap-4">
              {results.topMatches.map((match, i) => (
                <div key={i} className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="text-5xl">{match.visa.flag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-space font-bold">{match.visa.name}</h3>
                      <span className="px-2 py-1 bg-indigo-bloom/5 text-indigo-bloom text-xs rounded font-mono font-medium">{match.visa.country}</span>
                    </div>
                    <p className="text-sm text-indigo-950/60 mb-4">{match.visa.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-indigo-bloom/70">
                      <div className="flex items-center gap-1.5"><Icon icon="lucide:clock" /> {match.visa.processingTime}</div>
                      <div className="flex items-center gap-1.5"><Icon icon="lucide:wallet" /> {match.visa.estimatedCost}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <span className="text-3xl font-space font-bold text-neon-pink">{match.score}%</span>
                    <span className="text-[10px] uppercase tracking-widest text-indigo-950/40 font-mono">{match.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="glass-card p-6 border-l-4 border-l-green-400">
                <h3 className="font-space font-bold text-lg mb-4 flex items-center gap-2 text-green-600">
                  <Icon icon="lucide:check-circle" /> Profile Strengths
                </h3>
                <ul className="space-y-3">
                  {results.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-indigo-950/80">
                      <Icon icon="lucide:arrow-right" className="text-green-500 shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-blue-400">
                <h3 className="font-space font-bold text-lg mb-4 flex items-center gap-2 text-blue-600">
                  <Icon icon="lucide:trending-up" /> Areas to Improve
                </h3>
                <ul className="space-y-3">
                  {results.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-indigo-950/80">
                      <Icon icon="lucide:arrow-right" className="text-blue-500 shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}