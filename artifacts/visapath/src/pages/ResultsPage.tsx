import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'wouter';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { loadAssessment } from '@/types';
import { calculateScores, type ScoringResult, type VisaScore } from '@/lib/scoring';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function VisaCard({ match, rank }: { match: VisaScore; rank?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="text-5xl flex-shrink-0">{match.visa.flag}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {rank === 0 && (
              <span className="px-2 py-0.5 bg-neon-pink text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Best Match</span>
            )}
            <h3 className="text-xl font-space font-bold">{match.visa.name}</h3>
            <span className="px-2 py-1 bg-indigo-bloom/5 text-indigo-bloom text-xs rounded font-mono font-medium">{match.visa.country}</span>
          </div>
          <p className="text-sm text-indigo-950/60 mb-3">{match.visa.description}</p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-indigo-bloom/70">
            <div className="flex items-center gap-1.5"><Icon icon="lucide:clock" /> {match.visa.processingTime}</div>
            <div className="flex items-center gap-1.5"><Icon icon="lucide:wallet" /> {match.visa.estimatedCost}</div>
            {match.visa.sponsorshipRequired && (
              <div className="flex items-center gap-1.5 text-amber-600"><Icon icon="lucide:briefcase" /> Employer sponsor required</div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[110px]">
          <span className="text-3xl font-space font-bold text-neon-pink">{match.score}%</span>
          <span className="text-[10px] uppercase tracking-widest text-indigo-950/40 font-mono text-right">{match.category}</span>
          <button
            onClick={() => setOpen(o => !o)}
            className="text-[10px] font-mono uppercase tracking-widest text-indigo-bloom hover:text-neon-pink transition-colors mt-1 flex items-center gap-1"
          >
            {open ? 'Hide' : 'Details'} <Icon icon={open ? 'lucide:chevron-up' : 'lucide:chevron-down'} />
          </button>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-1.5 bg-indigo-bloom/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-bloom to-neon-pink rounded-full transition-all duration-1000"
          style={{ width: `${match.score}%` }}
        />
      </div>

      {/* Expandable detail panel */}
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-indigo-bloom/10 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Why you score this */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-green-600 mb-2 flex items-center gap-1">
              <Icon icon="lucide:check-circle" /> Reasons for score
            </div>
            <ul className="space-y-1.5">
              {match.strengths.length > 0 ? match.strengths.map((s, i) => (
                <li key={i} className="text-xs text-indigo-950/70 flex items-start gap-1.5">
                  <Icon icon="lucide:arrow-right" className="text-green-500 shrink-0 mt-0.5" /> {s}
                </li>
              )) : <li className="text-xs text-indigo-950/40 italic">Build your profile to unlock strengths</li>}
            </ul>
          </div>

          {/* Missing requirements */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-1">
              <Icon icon="lucide:alert-triangle" /> Missing requirements
            </div>
            <ul className="space-y-1.5">
              {match.missingRequirements.length > 0 ? match.missingRequirements.map((r, i) => (
                <li key={i} className="text-xs text-indigo-950/70 flex items-start gap-1.5">
                  <Icon icon="lucide:x-circle" className="text-amber-500 shrink-0 mt-0.5" /> {r}
                </li>
              )) : <li className="text-xs text-green-600 flex items-center gap-1.5"><Icon icon="lucide:check" />No critical gaps identified</li>}
            </ul>
          </div>

          {/* How to improve */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-1">
              <Icon icon="lucide:trending-up" /> How to improve
            </div>
            <ul className="space-y-1.5">
              {match.improvements.map((imp, i) => (
                <li key={i} className="text-xs text-indigo-950/70 flex items-start gap-1.5">
                  <Icon icon="lucide:arrow-up-right" className="text-blue-500 shrink-0 mt-0.5" /> {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const [, navigate] = useLocation();
  const [results, setResults] = useState<ScoringResult | null>(null);
  const [targetCountry, setTargetCountry] = useState('');
  const [aiInsights, setAiInsights] = useState<{ qualification: string; risks: string } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const data = loadAssessment();
    if (!data) { navigate('/assessment'); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scored = calculateScores(data as any);
    setResults(scored);
    setTargetCountry((data as any).targetCountry ?? '');

    const top = scored.topMatches[0];
    if (top) {
      setInsightsLoading(true);
      fetch(`${BASE}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment: data, visaId: top.visa.id, visaName: top.visa.name, visaCountry: top.visa.country, score: top.score }),
      })
        .then(r => r.json())
        .then(d => { if (d.qualification) setAiInsights({ qualification: d.qualification, risks: d.risks }); })
        .catch(() => {})
        .finally(() => setInsightsLoading(false));
    }
  }, [navigate]);

  if (!results) return null;

  const offset = 452 - (452 * results.overallScore / 100);
  const hasAlts = results.alternativeCountries.length > 0;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <AnimatedBackground />
      <NavBar activeItem="results" />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto pt-32 px-6 pb-20">
        <div className="text-center mb-16">
          <h1 className="font-space text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text-animate">Immigration Intelligence Report</span>
          </h1>
          <p className="text-xl text-indigo-950/70">
            Personalised pathways based on your profile
            {targetCountry && <> — target: <span className="font-bold text-indigo-bloom">{targetCountry}</span></>}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column — score card */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-card p-10 flex flex-col items-center text-center">
              <div className="text-sm font-mono text-indigo-bloom/70 uppercase tracking-widest mb-6">
                {targetCountry ? `${targetCountry} Eligibility` : 'Overall Eligibility Score'}
              </div>
              <div className="relative flex flex-col items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-indigo-bloom/10" />
                  <circle
                    cx="96" cy="96" r="80"
                    stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neon-pink"
                    strokeDasharray="502" strokeDashoffset={offset} strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px #f42272)', transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-space font-bold">{results.overallScore}%</span>
                </div>
              </div>
              <div className="bg-neon-pink/10 text-neon-pink px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-sm mb-4">
                {results.overallCategory}
              </div>
              {targetCountry && results.targetCountryVisas.length === 0 && (
                <p className="text-xs text-amber-600 font-mono text-center">
                  No visa pathways found for {targetCountry}. Showing closest alternatives.
                </p>
              )}
              {targetCountry && results.targetCountryVisas.length > 0 && (
                <p className="text-indigo-950/60 text-sm">
                  Your strongest match for {targetCountry} is the <span className="font-semibold">{results.targetCountryVisas[0].visa.name}</span>.
                </p>
              )}
            </div>

            {(insightsLoading || aiInsights) && (
              <div className="glass-card p-6 border-l-4 border-l-neon-pink">
                <h3 className="font-space font-bold text-sm mb-3 flex items-center gap-2 text-indigo-bloom">
                  <Icon icon="lucide:sparkles" className="text-neon-pink" />
                  AI Assessment
                </h3>
                {insightsLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 bg-indigo-bloom/10 rounded w-full" />
                    <div className="h-3 bg-indigo-bloom/10 rounded w-5/6" />
                    <div className="h-3 bg-indigo-bloom/10 rounded w-4/6" />
                    <div className="h-3 bg-indigo-bloom/10 rounded w-full mt-4" />
                    <div className="h-3 bg-indigo-bloom/10 rounded w-3/4" />
                  </div>
                ) : aiInsights && (
                  <div className="space-y-4 text-xs text-indigo-950/70 leading-relaxed">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-green-600 block mb-1 flex items-center gap-1">
                        <Icon icon="lucide:check-circle" className="text-[10px]" /> Why you qualify
                      </span>
                      <p>{aiInsights.qualification}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 block mb-1 flex items-center gap-1">
                        <Icon icon="lucide:alert-triangle" className="text-[10px]" /> Key risks
                      </span>
                      <p>{aiInsights.risks}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link href="/advisor" className="light-beam-btn w-full py-5 text-lg font-semibold group flex items-center justify-center gap-3">
              <div className="beam-border animate-border-spin"></div>
              <Icon icon="lucide:message-square" />
              Chat with AI Advisor
            </Link>
            <Link href="/roadmaps" className="w-full py-4 text-center text-indigo-bloom hover:bg-white/50 rounded-full border border-indigo-bloom/20 transition-all font-medium active:scale-95">
              View My Roadmap
            </Link>
            <Link href="/assessment" className="w-full py-4 text-center text-indigo-bloom/60 hover:bg-white/50 rounded-full border border-indigo-bloom/10 transition-all font-medium text-sm active:scale-95">
              Retake Assessment
            </Link>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* TARGET COUNTRY section */}
            {results.targetCountryVisas.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-space font-bold text-[#1a0f2e]">
                    Target Country Match
                  </h2>
                  <span className="px-3 py-1 bg-indigo-bloom/8 text-indigo-bloom text-xs font-mono rounded-full uppercase tracking-widest">
                    {targetCountry}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {results.targetCountryVisas.map((match, i) => (
                    <VisaCard key={match.visa.id} match={match} rank={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Profile strengths + improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-green-400">
                <h3 className="font-space font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
                  <Icon icon="lucide:check-circle" /> Profile Strengths
                </h3>
                <ul className="space-y-3">
                  {results.strengths.length > 0
                    ? results.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-indigo-950/80">
                          <Icon icon="lucide:arrow-right" className="text-green-500 shrink-0 mt-0.5" /> {s}
                        </li>
                      ))
                    : <li className="text-sm text-indigo-950/40 italic">Complete more of your profile to unlock strengths</li>
                  }
                </ul>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-blue-400">
                <h3 className="font-space font-bold text-lg mb-4 flex items-center gap-2 text-blue-700">
                  <Icon icon="lucide:trending-up" /> How to Improve
                </h3>
                <ul className="space-y-3">
                  {results.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-indigo-950/80">
                      <Icon icon="lucide:arrow-up-right" className="text-blue-500 shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ALTERNATIVE COUNTRIES section — only if they score higher */}
            {hasAlts && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-space font-bold text-[#1a0f2e]">
                    Countries with Stronger Eligibility
                  </h2>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-mono rounded-full uppercase tracking-widest">
                    Alternative
                  </span>
                </div>
                <p className="text-sm text-indigo-950/50 mb-4">
                  Your profile scores higher for these destinations. They are shown as alternatives — your target remains {targetCountry}.
                </p>
                <div className="flex flex-col gap-4">
                  {results.alternativeCountries.map(alt => (
                    <VisaCard key={alt.topVisa.visa.id} match={alt.topVisa} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
