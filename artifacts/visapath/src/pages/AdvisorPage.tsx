import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'wouter';
import gsap from 'gsap';
import NavBar from '@/components/NavBar';
import { loadAssessment, type Assessment } from '@/types';
import { getInitialMessage, generateResponse } from '@/lib/advisor';
import { calculateScores } from '@/lib/scoring';

type Message = {
  role: 'ai' | 'user';
  content: string;
  time: string;
};

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [topVisa, setTopVisa] = useState<string | undefined>();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = loadAssessment() as Assessment | null;
    let tv;
    if (data) {
      setAssessment(data);
      const scores = calculateScores(data);
      tv = scores.topMatches[0]?.visa.id;
      setTopVisa(tv);
    }
    
    setMessages([{
      role: 'ai',
      content: getInitialMessage(data, tv),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    gsap.from(".suggestion-chip", { scale: 0.9, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(2)" });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    
    const newMsg: Message = { role: 'user', content: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    setTimeout(() => {
      const response = generateResponse(text, assessment, topVisa);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 800);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8f6ff]">
      <div className="gooey-wrapper">
        <div className="blob b1" style={{ background: 'radial-gradient(circle,rgba(203, 203, 246, 0.6) 0,transparent 70%)', animation: 'moveB1 20s infinite alternate' }}></div>
        <div className="blob b2" style={{ background: 'radial-gradient(circle,rgba(242, 145, 212, 0.4) 0,transparent 70%)', animation: 'moveB2 25s infinite alternate' }}></div>
      </div>
      
      <NavBar activeItem="advisor" />

      <main className="relative z-10 flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full pt-28 pb-10 gap-6 px-4 lg:px-6">
        <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-white/[0.03] backdrop-blur-[24px] border border-white/10 rounded-[28px] p-6 glass-card bg-white/70">
            <h3 className="font-space font-bold text-lg mb-4 text-indigo-bloom">Your Profile</h3>
            {assessment ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-indigo-bloom/10 pb-2">
                  <span className="text-indigo-950/60">Education</span>
                  <span className="font-medium">{assessment.degree}</span>
                </div>
                <div className="flex justify-between border-b border-indigo-bloom/10 pb-2">
                  <span className="text-indigo-950/60">Experience</span>
                  <span className="font-medium">{assessment.workExperience} years</span>
                </div>
                <div className="flex justify-between border-b border-indigo-bloom/10 pb-2">
                  <span className="text-indigo-950/60">English</span>
                  <span className="font-medium">{assessment.englishScore}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-indigo-950/60">Target</span>
                  <span className="font-medium">{assessment.targetCountry}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-indigo-950/60 text-center py-4">
                Assessment not completed.<br/>
                <Link href="/assessment" className="text-neon-pink font-medium mt-2 inline-block hover:underline">Start Assessment</Link>
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-6 relative min-h-[70vh]">
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-bloom/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-indigo-bloom flex items-center justify-center">
              <Icon icon="lucide:cpu" className="text-white text-xl" />
            </div>
            <div>
              <h2 className="font-space font-bold text-lg leading-tight">Immigration Intelligence</h2>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-950/60">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                AI Online
              </div>
            </div>
          </div>

          <div ref={chatContainerRef} className="chat-container flex-1 overflow-y-auto space-y-6 pr-2 max-h-[calc(100vh-320px)]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'flex-col items-start gap-3'}`}>
                {m.role === 'ai' && (
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-pink to-indigo-bloom flex items-center justify-center">
                      <Icon icon="lucide:cpu" className="text-white text-sm" />
                    </div>
                    <span className="text-xs font-space font-bold text-indigo-bloom uppercase tracking-widest">VisaPath AI</span>
                  </div>
                )}
                <div className={`px-6 py-4 rounded-3xl max-w-[85%] shadow-sm relative overflow-hidden ${
                  m.role === 'user' 
                    ? 'bg-[#f0e8ff] border border-indigo-100 rounded-tr-none text-[#2d1b4e]' 
                    : 'bg-[#faf8ff] border-indigo-bloom/10 rounded-tl-none text-indigo-bloom glass-card'
                }`}>
                  {m.role === 'ai' && <div className="absolute top-0 left-0 w-1 h-full bg-neon-pink"></div>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  <span className={`block text-[10px] font-mono mt-2 uppercase opacity-50 ${m.role === 'user' ? 'text-right text-indigo-950' : 'text-left text-indigo-bloom'}`}>{m.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {['Calculate Fees', 'Official Sources', 'Processing Time', 'Alternative Visas'].map(chip => (
              <button 
                key={chip} 
                onClick={() => handleSend(chip)}
                className="suggestion-chip px-4 py-2 rounded-full border border-indigo-bloom/20 bg-white/50 hover:bg-white text-xs font-medium text-indigo-bloom transition-all shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about requirements, pathways, or documentation..." 
              className="w-full bg-white/80 backdrop-blur-xl border border-indigo-bloom/20 rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all shadow-sm" 
            />
            <button 
              onClick={() => handleSend()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-neon-pink to-indigo-bloom rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Icon icon="lucide:send" className="text-white" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}