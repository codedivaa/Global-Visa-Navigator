import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'wouter';
import gsap from 'gsap';
import NavBar from '@/components/NavBar';
import { loadAssessment, type Assessment } from '@/types';
import { calculateScores } from '@/lib/scoring';

type Message = {
  role: 'ai' | 'user';
  content: string;
  time: string;
  isStreaming?: boolean;
};

type AnalysisData = {
  qualification: string;
  risks: string;
  documents: string;
  nextSteps: string;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [topVisa, setTopVisa] = useState<{ id: string; name: string; country: string; score: number } | undefined>();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = loadAssessment() as Assessment | null;
    if (data) {
      setAssessment(data);
      const scores = calculateScores(data);
      const top = scores.topMatches[0];
      if (top) {
        const tv = { id: top.visa.id, name: top.visa.name, country: top.visa.country, score: top.score };
        setTopVisa(tv);
        fetchAnalysis(data, tv);
      } else {
        setMessages([{
          role: 'ai',
          content: 'Welcome to VisaPath AI. I have analysed your profile but could not find a strong visa match. Please retake the assessment with more details about your target country and employment situation.',
          time: formatTime(),
        }]);
      }
    } else {
      setMessages([{
        role: 'ai',
        content: 'Welcome to VisaPath AI — your personal immigration intelligence advisor.\n\nComplete the assessment first so I can provide personalised guidance based on your specific profile. What would you like to know about global visa programs?',
        time: formatTime(),
      }]);
    }

    gsap.from('.suggestion-chip', { scale: 0.9, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchAnalysis(data: Assessment, tv: { id: string; name: string; country: string; score: number }) {
    setAnalysisLoading(true);
    setMessages([{
      role: 'ai',
      content: `Analysing your profile for the **${tv.name}** (${tv.country})…`,
      time: formatTime(),
    }]);

    try {
      const res = await fetch(`${BASE}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment: data,
          visaId: tv.id,
          visaName: tv.name,
          visaCountry: tv.country,
          score: tv.score,
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze');
      const result: AnalysisData = await res.json();
      setAnalysis(result);

      const summary = `I have analysed your complete profile for the **${tv.name}** (${tv.country}) — ${tv.score}% eligibility match.\n\n` +
        `**Why you qualify:** ${result.qualification}\n\n` +
        `**Key risks to address:** ${result.risks}\n\n` +
        `**Priority documents:** ${result.documents}\n\n` +
        `**Your next steps:** ${result.nextSteps}\n\n` +
        `Ask me anything — processing times, fees, language requirements, alternative pathways, or how to improve your score.`;

      setMessages([{ role: 'ai', content: summary, time: formatTime() }]);
    } catch {
      setMessages([{
        role: 'ai',
        content: `I have reviewed your profile for the **${tv.name}** (${tv.country}) with a ${tv.score}% eligibility score.\n\nAsk me about fees, processing times, language requirements, or alternative pathways.`,
        time: formatTime(),
      }]);
    } finally {
      setAnalysisLoading(false);
    }
  }

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = { role: 'user', content: text, time: formatTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    const aiPlaceholder: Message = { role: 'ai', content: '', time: formatTime(), isStreaming: true };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      const res = await fetch(`${BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          assessment,
          visaName: topVisa?.name,
          visaCountry: topVisa?.country,
          score: topVisa?.score,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.content) {
              accumulated += data.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'ai', content: accumulated, time: formatTime(), isStreaming: true };
                return updated;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'ai',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          time: formatTime(),
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setIsSending(false);
    }
  };

  function renderMessage(content: string) {
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  const extendedAssessment = assessment as (Assessment & { immigrationGoal?: string; fieldOfStudy?: string; targetLanguageLevel?: string }) | null;

  const profileRows = extendedAssessment ? [
    { label: 'Goal', value: extendedAssessment.immigrationGoal || '—' },
    { label: 'Nationality', value: extendedAssessment.nationality },
    { label: 'Target', value: extendedAssessment.targetCountry },
    { label: 'Education', value: extendedAssessment.degree + (extendedAssessment.fieldOfStudy ? ` · ${extendedAssessment.fieldOfStudy}` : '') },
    { label: 'Experience', value: `${extendedAssessment.workExperience} yrs` },
    { label: 'English', value: extendedAssessment.englishScore },
    ...(extendedAssessment.targetLanguageLevel ? [{ label: 'Language', value: extendedAssessment.targetLanguageLevel }] : []),
    { label: 'Job Offer', value: extendedAssessment.jobOffer },
  ] : [];

  const SUGGESTION_CHIPS = assessment
    ? [
        `What are the ${topVisa?.country ?? 'visa'} fees?`,
        'Improve my score',
        'Processing time',
        'Alternative pathways',
        'What language do I need?',
        'Documents checklist',
      ]
    : ['Canada Express Entry', 'Germany Opportunity Card', 'Japan Engineer Visa', 'UK Skilled Worker'];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <div className="gooey-wrapper">
        <div className="blob b1" style={{ background: 'radial-gradient(circle,rgba(203, 203, 246, 0.6) 0,transparent 70%)', animation: 'moveB1 20s infinite alternate' }}></div>
        <div className="blob b2" style={{ background: 'radial-gradient(circle,rgba(242, 145, 212, 0.4) 0,transparent 70%)', animation: 'moveB2 25s infinite alternate' }}></div>
      </div>

      <NavBar activeItem="advisor" />

      <main className="relative z-10 flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full pt-28 pb-10 gap-6 px-4 lg:px-6">
        {/* Sidebar */}
        <aside className="w-full md:w-80 flex flex-col gap-4 shrink-0">
          <div className="glass-card bg-white/70 p-6">
            <h3 className="font-space font-bold text-lg mb-4 text-indigo-bloom">Your Profile</h3>
            {extendedAssessment ? (
              <div className="space-y-2 text-sm">
                {profileRows.map(row => (
                  <div key={row.label} className="flex justify-between border-b border-indigo-bloom/10 pb-1.5">
                    <span className="text-indigo-950/50 shrink-0 mr-2">{row.label}</span>
                    <span className="font-medium text-right truncate">{row.value}</span>
                  </div>
                ))}
                {topVisa && (
                  <div className="mt-4 pt-4 border-t border-indigo-bloom/10">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-bloom/60 mb-1">Top Match</div>
                    <div className="font-space font-bold text-sm text-indigo-bloom">{topVisa.name}</div>
                    <div className="text-xs text-neon-pink font-bold mt-0.5">{topVisa.score}% match · {topVisa.country}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-indigo-950/60 text-center py-4">
                Assessment not completed.<br />
                <Link href="/assessment" className="text-neon-pink font-medium mt-2 inline-block hover:underline">Start Assessment</Link>
              </div>
            )}
          </div>

          {analysis && (
            <div className="glass-card bg-white/70 p-6">
              <h3 className="font-space font-bold text-sm mb-3 text-indigo-bloom flex items-center gap-2">
                <Icon icon="lucide:file-text" className="text-neon-pink" />
                Priority Documents
              </h3>
              <div className="text-xs text-indigo-950/60 leading-relaxed">
                {analysis.documents}
              </div>
            </div>
          )}

          <Link href="/roadmaps" className="glass-card bg-white/70 p-4 flex items-center gap-3 hover:bg-white/90 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-indigo-bloom/8 flex items-center justify-center flex-shrink-0 group-hover:bg-neon-pink/10 transition-colors">
              <Icon icon="lucide:map" className="text-indigo-bloom group-hover:text-neon-pink transition-colors" />
            </div>
            <div>
              <div className="font-medium text-sm">View Roadmap</div>
              <div className="text-xs text-indigo-950/50">Step-by-step timeline</div>
            </div>
            <Icon icon="lucide:arrow-right" className="ml-auto text-indigo-bloom/30 group-hover:text-neon-pink transition-colors" />
          </Link>
        </aside>

        {/* Chat area */}
        <section className="flex-1 flex flex-col gap-4 relative min-h-[70vh]">
          {/* Header */}
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-bloom/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-indigo-bloom flex items-center justify-center">
              <Icon icon="lucide:cpu" className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h2 className="font-space font-bold text-lg leading-tight">Immigration Intelligence</h2>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-950/60">
                <span className={`w-2 h-2 rounded-full ${analysisLoading || isSending ? 'bg-yellow-400 animate-pulse' : 'bg-green-500 animate-pulse'}`}></span>
                {analysisLoading ? 'Analysing profile…' : isSending ? 'Thinking…' : 'Gemini AI Online'}
              </div>
            </div>
            {assessment && (
              <div className="text-right hidden md:block">
                <div className="text-[10px] font-mono uppercase text-indigo-bloom/50">Target</div>
                <div className="text-sm font-bold text-indigo-bloom">{assessment.targetCountry}</div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 max-h-[calc(100vh-340px)] min-h-[300px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'flex-col items-start gap-3'}`}>
                {m.role === 'ai' && (
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-indigo-bloom flex items-center justify-center">
                      <Icon icon="lucide:cpu" className="text-white text-sm" />
                    </div>
                    <span className="text-xs font-space font-bold text-indigo-bloom uppercase tracking-widest">VisaPath AI</span>
                    {m.isStreaming && (
                      <span className="inline-flex gap-0.5 items-end h-4">
                        <span className="w-1 h-1 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1 h-1 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1 h-1 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </span>
                    )}
                  </div>
                )}
                <div className={`px-6 py-4 rounded-3xl max-w-[88%] shadow-sm relative overflow-hidden ${
                  m.role === 'user'
                    ? 'bg-[#f0e8ff] border border-indigo-100 rounded-tr-none text-[#2d1b4e]'
                    : 'bg-[#faf8ff] border-indigo-bloom/10 rounded-tl-none text-indigo-bloom glass-card'
                }`}>
                  {m.role === 'ai' && <div className="absolute top-0 left-0 w-1 h-full bg-neon-pink"></div>}
                  <p
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: m.content ? renderMessage(m.content) : (m.isStreaming ? '&nbsp;' : '') }}
                  />
                  <span className={`block text-[10px] font-mono mt-2 uppercase opacity-50 ${m.role === 'user' ? 'text-right text-indigo-950' : 'text-left text-indigo-bloom'}`}>{m.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                disabled={isSending || analysisLoading}
                className="suggestion-chip px-4 py-2 rounded-full border border-indigo-bloom/20 bg-white/50 hover:bg-white text-xs font-medium text-indigo-bloom transition-all shadow-sm disabled:opacity-40 hover:border-neon-pink/40 hover:text-neon-pink"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isSending && handleSend()}
              placeholder="Ask about requirements, fees, processing times, or pathways…"
              disabled={isSending || analysisLoading}
              className="w-full bg-white/80 backdrop-blur-xl border border-indigo-bloom/20 rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all shadow-sm disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={isSending || analysisLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-neon-pink to-indigo-bloom rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40"
            >
              <Icon icon="lucide:send" className="text-white" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
