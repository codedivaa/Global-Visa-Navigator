import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'wouter';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAssessments, type AssessmentRow } from '@/lib/db';
import { calculateScores } from '@/lib/scoring';
import { saveAssessment } from '@/types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function HistoryPage() {
  const { user, signInWithGoogle } = useAuth();
  const [, navigate] = useLocation();
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserAssessments(user.id).then(data => {
      setRows(data);
      setLoading(false);
    });
  }, [user]);

  function loadAssessment(row: AssessmentRow) {
    saveAssessment(row.data as Parameters<typeof saveAssessment>[0]);
    localStorage.setItem('visapath_assessment_id', row.id);
    navigate('/results');
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <AnimatedBackground />
      <NavBar activeItem={null} />

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto pt-32 px-6 pb-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 mb-6 border-indigo-bloom/20">
            <Icon icon="lucide:history" className="text-neon-pink text-sm" />
            <span className="text-xs font-mono text-indigo-bloom uppercase tracking-widest">Assessment History</span>
          </div>
          <h1 className="font-space text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text-animate">Your Assessments</span>
          </h1>
          <p className="text-xl text-indigo-950/70">
            Click any assessment to reload it and view full results.
          </p>
        </div>

        {!user ? (
          <div className="glass-card p-16 flex flex-col items-center text-center gap-6 max-w-xl mx-auto">
            <Icon icon="lucide:lock" className="text-5xl text-indigo-bloom/40" />
            <h2 className="font-space text-2xl font-bold">Sign In to View History</h2>
            <p className="text-indigo-950/60">
              Your assessment history is saved to your account. Sign in with Google to access it.
            </p>
            <button
              onClick={signInWithGoogle}
              className="light-beam-btn px-8 py-4 font-semibold flex items-center gap-2"
            >
              <Icon icon="flat-color-icons:google" className="text-lg" />
              Sign in with Google
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="h-4 bg-indigo-bloom/10 rounded w-2/3" />
                <div className="h-10 bg-indigo-bloom/6 rounded-xl" />
                <div className="h-3 bg-indigo-bloom/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="glass-card p-16 flex flex-col items-center text-center gap-6 max-w-xl mx-auto">
            <Icon icon="lucide:clipboard-list" className="text-5xl text-indigo-bloom/40" />
            <h2 className="font-space text-2xl font-bold">No Assessments Yet</h2>
            <p className="text-indigo-950/60">Complete your first assessment to start building your immigration profile.</p>
            <Link href="/assessment" className="light-beam-btn px-8 py-4 font-semibold">
              Start Assessment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map(row => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const d = row.data as any;
              let topVisa: { name: string; country: string; flag: string; score: number } | null = null;
              try {
                const scored = calculateScores(d);
                const top = scored.topMatches[0];
                if (top) topVisa = { name: top.visa.name, country: top.visa.country, flag: top.visa.flag, score: top.score };
              } catch { /* ignore */ }

              return (
                <button
                  key={row.id}
                  onClick={() => loadAssessment(row)}
                  className="glass-card p-6 text-left hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-bloom/60 mb-1">{timeAgo(row.created_at)}</div>
                      <div className="font-space font-bold text-base leading-tight">
                        {d.immigrationGoal || 'Assessment'}
                      </div>
                      <div className="text-sm text-indigo-950/60 mt-0.5">→ {d.targetCountry || 'Unknown'}</div>
                    </div>
                    <Icon icon="lucide:arrow-right" className="text-indigo-bloom/30 group-hover:text-neon-pink group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>

                  {topVisa && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-bloom/4 border border-indigo-bloom/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{topVisa.flag}</span>
                        <div>
                          <div className="text-xs font-semibold leading-tight">{topVisa.name}</div>
                          <div className="text-[10px] text-indigo-950/50">{topVisa.country}</div>
                        </div>
                        <span className="ml-auto text-sm font-bold text-neon-pink font-space">{topVisa.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-indigo-bloom/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-bloom to-neon-pink rounded-full"
                          style={{ width: `${topVisa.score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3 text-xs text-indigo-950/50">
                    {d.nationality && <span className="flex items-center gap-1"><Icon icon="lucide:globe" className="text-[10px]" />{d.nationality}</span>}
                    {d.degree && <span className="flex items-center gap-1"><Icon icon="lucide:graduation-cap" className="text-[10px]" />{d.degree}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/assessment" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-indigo-bloom/20 text-indigo-bloom hover:bg-indigo-bloom/5 transition-all text-sm font-medium">
              <Icon icon="lucide:plus" />
              New Assessment
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
