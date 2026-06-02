import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'wouter';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { loadAssessment, type Assessment } from '@/types';
import { calculateScores, type VisaScore } from '@/lib/scoring';

const DOC_MAP: Record<string, string[]> = {
  'canada-ee': [
    'Valid passport (6+ months)',
    'IELTS / CELPIP results',
    'Educational Credential Assessment (ECA)',
    'Employment reference letters',
    'Proof of funds (min. CAD $13,757)',
    'Police clearance certificate',
    'Medical examination results',
    'Provincial nomination letter (if applicable)',
  ],
  'germany-oc': [
    'Valid passport',
    'Recognized qualification / degree certificate',
    'Proof of English or German proficiency (B2+)',
    'Proof of financial resources (€1,027/month)',
    'Health insurance proof',
    'Biometric photos',
    'CV / Resume in German format',
    'Motivation letter',
  ],
  'h1b': [
    'Valid passport',
    'Form I-129 (filed by employer)',
    'Labor Condition Application (LCA)',
    'Degree transcripts + diploma',
    'Employment offer letter',
    'DS-160 visa application',
    'SEVIS fee receipt',
    'Previous US visa (if any)',
  ],
  'uk-sw': [
    'Valid passport',
    'Certificate of Sponsorship (CoS)',
    'English language proof (B1+)',
    'Financial requirement evidence',
    'Tuberculosis test results (if applicable)',
    'Academic qualifications',
    'BRP card biometrics appointment',
  ],
  'australia-189': [
    'Valid passport',
    'Skills assessment from relevant authority',
    'IELTS results (min. 6.0 overall)',
    'Expression of Interest (EOI) via SkillSelect',
    'Health examination certificate',
    'Police clearance (all countries lived in)',
    'Employment records (last 10 years)',
    'Superannuation / funds evidence',
  ],
  'o1a': [
    'Valid passport',
    'Form I-129O petition (by employer/agent)',
    'Evidence of extraordinary ability (awards, publications)',
    'Peer review letters (3+)',
    'Salary/contract evidence',
    'Media coverage / press mentions',
    'Organization memberships',
  ],
  'eb2niw': [
    'Valid passport',
    'Form I-140 petition',
    'Advanced degree transcripts',
    'National interest benefit statement',
    'Evidence of exceptional ability',
    'Three independent expert letters',
    'Published research / patents (if applicable)',
  ],
};

const MILESTONE_MAP: Record<string, { month: string; label: string; detail: string }[]> = {
  'canada-ee': [
    { month: 'Month 1–2', label: 'Language Test', detail: 'Take IELTS / CELPIP and get results' },
    { month: 'Month 2–3', label: 'ECA & Profile Creation', detail: 'Get credential assessed, create Express Entry profile' },
    { month: 'Month 3–6', label: 'Wait for ITA', detail: 'Improve CRS score, await Invitation to Apply' },
    { month: 'Month 6–9', label: 'Application Submission', detail: 'Submit full PR application within 60 days of ITA' },
    { month: 'Month 9–15', label: 'IRCC Processing', detail: 'Biometrics, medicals, background checks' },
    { month: 'Month 15+', label: 'PR Landing', detail: 'Receive COPR, land in Canada as permanent resident' },
  ],
  'germany-oc': [
    { month: 'Month 1', label: 'Document Preparation', detail: 'Gather degree, CV, proof of funds, language certificate' },
    { month: 'Month 1–2', label: 'Visa Application', detail: 'Submit to German embassy / consulate in your country' },
    { month: 'Month 2–4', label: 'Visa Approval', detail: 'Receive Opportunity Card (valid 1 year)' },
    { month: 'Month 4–8', label: 'Job Search in Germany', detail: 'Actively search for employers who will sponsor you' },
    { month: 'Month 8–12', label: 'Work Permit Conversion', detail: 'Convert to work permit once you have a job offer' },
    { month: 'Year 2+', label: 'Permanent Residency Path', detail: 'Apply for Niederlassungserlaubnis after qualifying period' },
  ],
  'h1b': [
    { month: 'Oct–Dec', label: 'Find Employer Sponsor', detail: 'Secure a US company willing to file H-1B' },
    { month: 'Mar 1–20', label: 'USCIS Registration', detail: 'Employer registers in the H-1B lottery (cap-subject)' },
    { month: 'Apr', label: 'Lottery Selection', detail: 'USCIS runs random lottery; ~20% selection rate' },
    { month: 'Apr–Jun', label: 'Petition Filing', detail: 'Employer files Form I-129 for selected registrants' },
    { month: 'Jun–Sep', label: 'USCIS Adjudication', detail: 'Premium processing (15 days) or regular (~4 months)' },
    { month: 'Oct 1', label: 'H-1B Start Date', detail: 'Cap-subject H-1B visas begin on October 1st' },
  ],
  default: [
    { month: 'Month 1–2', label: 'Research & Preparation', detail: 'Research requirements, gather initial documents' },
    { month: 'Month 2–4', label: 'Document Collection', detail: 'Obtain all required certificates and assessments' },
    { month: 'Month 4–6', label: 'Application Submission', detail: 'Submit visa application with all documents' },
    { month: 'Month 6–10', label: 'Processing Period', detail: 'Government review, biometrics, medicals if required' },
    { month: 'Month 10–14', label: 'Decision & Approval', detail: 'Receive visa decision, prepare for travel' },
    { month: 'Month 14+', label: 'Arrival & Settlement', detail: 'Arrive in target country, begin settlement process' },
  ],
};

export default function RoadmapsPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [topMatch, setTopMatch] = useState<VisaScore | null>(null);

  useEffect(() => {
    const data = loadAssessment() as Assessment | null;
    if (data) {
      setAssessment(data);
      const scores = calculateScores(data);
      setTopMatch(scores.topMatches[0] ?? null);
    }
  }, []);

  const milestones = topMatch
    ? (MILESTONE_MAP[topMatch.visa.id] ?? MILESTONE_MAP.default)
    : MILESTONE_MAP.default;

  const docs = topMatch ? (DOC_MAP[topMatch.visa.id] ?? []) : [];

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
              ? `Personalized roadmap for ${topMatch.visa.name} — ${topMatch.visa.country}`
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
                    { label: 'Education', value: assessment.degree },
                    { label: 'Experience', value: `${assessment.workExperience} years` },
                    { label: 'English', value: assessment.englishScore },
                    { label: 'Job Offer', value: assessment.jobOffer },
                    { label: 'Target', value: assessment.targetCountry },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between border-b border-indigo-bloom/8 pb-2">
                      <span className="text-indigo-950/50">{item.label}</span>
                      <span className="font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
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
                </h2>
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

              {/* Next steps */}
              <div className="glass-card p-8 border-l-4 border-l-neon-pink">
                <h2 className="font-space font-bold text-xl mb-6 flex items-center gap-2">
                  <Icon icon="lucide:zap" className="text-neon-pink" />
                  Key Next Steps
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: 'lucide:book-open', step: 'Research official requirements', detail: 'Visit the official immigration website for your target country to confirm current requirements.' },
                    { icon: 'lucide:mic', step: 'Book language test', detail: 'Schedule IELTS, TOEFL, or equivalent — slots fill up 4–6 weeks in advance.' },
                    { icon: 'lucide:graduation-cap', step: 'Get credentials assessed', detail: 'Arrange an official credential evaluation from a recognized body in your target country.' },
                    { icon: 'lucide:cpu', step: 'Get AI guidance', detail: 'Use the AI Advisor to answer specific questions about your application.' },
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
