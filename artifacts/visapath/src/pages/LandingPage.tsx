import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'wouter';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import NavBar from '@/components/NavBar';
import AnimatedBackground from '@/components/AnimatedBackground';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Optional entrance animations could go here
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col">
      <AnimatedBackground />

      <div className="cube-container" style={{ top: '20%', left: '5%', opacity: 0.4 }}>
        <div className="cube-face face-front"></div><div className="cube-face face-back"></div><div className="cube-face face-right"></div><div className="cube-face face-left"></div><div className="cube-face face-top"></div><div className="cube-face face-bottom"></div>
      </div>
      <div className="cube-container" style={{ bottom: '15%', left: '85%', opacity: 0.3, animationDelay: '-5s' }}>
        <div className="cube-face face-front" style={{ borderColor: '#8B5CF6' }}></div><div className="cube-face face-back"></div><div className="cube-face face-right"></div><div className="cube-face face-left"></div><div className="cube-face face-top"></div><div className="cube-face face-bottom"></div>
      </div>

      <NavBar />

      <main className="relative z-10 flex-1 flex flex-col pt-32 overflow-visible">
        <section className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[85vh]">
          
          <div className="flex flex-col items-start gap-10 hero-text-container">
            <div className="flex flex-col gap-4">
              <div className="glass-card self-start px-4 py-1.5 flex items-center gap-2 border-cyan-500/30 shimmer">
                <Icon icon="lucide:sparkles" className="text-neon-pink animate-pulse" />
                <span className="text-xs font-mono text-neon-pink font-medium tracking-widest">AI-POWERED IMMIGRATION INTELLIGENCE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-neon-pink/50"></span>
                <span className="text-sm font-space text-neon-pink/80 font-medium uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">Move from where you are to where you want to be</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="font-space text-7xl md:text-8xl font-bold leading-[1.05] tracking-tighter text-[#1a0f2e]">
                Find Your Best <br/>
                <span className="gradient-text-animate underline-glow inline-block">Visa Path</span> <br/>
                In Minutes
              </h1>
              <p className="text-xl md:text-2xl text-indigo-950/70 max-w-xl leading-relaxed">
                Hyper-personalized pathways. Instant eligibility scoring. AI-driven roadmaps backed by global official sources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <Link href="/assessment" className="light-beam-btn px-12 py-5 h-16 group" data-testid="link-start-assessment">
                <div className="beam-border animate-border-spin"></div>
                <span className="relative z-10 flex items-center gap-3 font-semibold text-lg tracking-wide">
                  Start Assessment
                  <Icon icon="lucide:zap" className="text-neon-pink group-hover:scale-125 transition-transform" />
                </span>
              </Link>
              
              <button className="flex items-center gap-4 px-8 py-5 rounded-full border border-indigo-bloom/20 hover:bg-indigo-bloom/5 hover:border-indigo-bloom/40 transition-all text-indigo-bloom group">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-bloom/5 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                  <Icon icon="lucide:play" className="text-lg ml-1" />
                </span>
                <span className="font-semibold text-lg">Watch Demo</span>
              </button>
            </div>

            <div className="flex items-center gap-12 mt-4 border-t border-indigo-bloom/10 pt-10">
              <div className="flex flex-col group cursor-default">
                <span className="text-3xl font-space font-bold text-indigo-bloom group-hover:text-neon-pink transition-colors">50+</span>
                <span className="text-xs text-indigo-900/40 uppercase tracking-widest font-mono">Visa Types</span>
              </div>
              <div className="flex flex-col group cursor-default">
                <span className="text-3xl font-space font-bold text-indigo-bloom group-hover:text-indigo-bloom transition-colors">12k+</span>
                <span className="text-xs text-indigo-900/40 uppercase tracking-widest font-mono">Users Globally</span>
              </div>
              <div className="flex flex-col group cursor-default">
                <span className="text-3xl font-space font-bold text-indigo-bloom group-hover:text-pink-carnation transition-colors">98%</span>
                <span className="text-xs text-indigo-900/40 uppercase tracking-widest font-mono">Score Accuracy</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center items-center h-[750px] tilt-container">
            
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden rounded-[40px] opacity-60">
              <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200" className="absolute top-0 right-0 w-[600px] h-full object-cover destination-image grayscale opacity-30 mix-blend-screen" alt="NYC Skyline" />
            </div>

            <div className="glass-card absolute -top-10 -left-10 w-52 p-4 bounce-float z-10 border-indigo-bloom/10 bg-white/5" style={{ animationDelay: '-2s', animationDuration: '4s' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🇮🇳</span>
                <Icon icon="lucide:arrow-right" className="text-indigo-900/20 text-xs" />
                <span className="text-lg">🇨🇦</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono text-neon-pink uppercase tracking-widest">Express Entry</p>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-space font-bold">Canada PR</span>
                  <span className="text-xs text-green-400 font-mono">82%</span>
                </div>
                <div className="w-full h-1 bg-indigo-bloom/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[82%]"></div>
                </div>
              </div>
            </div>

            <div className="glass-card absolute top-1/3 -right-20 w-52 p-4 bounce-float z-20 border-indigo-bloom/10 bg-white/5 shadow-2xl" style={{ animationDelay: '-4s', animationDuration: '5s' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🇮🇳</span>
                <Icon icon="lucide:arrow-right" className="text-indigo-900/20 text-xs" />
                <span className="text-lg">🇩🇪</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Opportunity Card</p>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-space font-bold">Germany Job</span>
                  <span className="text-xs text-indigo-400 font-mono">75%</span>
                </div>
                <div className="w-full h-1 bg-indigo-bloom/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[75%]"></div>
                </div>
              </div>
            </div>
            
            <div className="glass-card tilt-card absolute top-0 right-10 w-64 p-8 bounce-float z-30 shadow-[0_30px_60px_-15px_rgba(6,182,212,0.3)]" style={{ animationDelay: '-1.5s' }}>
              <div className="flex justify-between items-start mb-8">
                <span className="text-xs font-mono text-neon-pink tracking-tighter">PROBABILITY SCORE</span>
                <Icon icon="lucide:activity" className="text-neon-pink text-xl animate-pulse" />
              </div>
              <div className="relative flex flex-col items-center">
                 <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-indigo-bloom/5" />
                  <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-neon-pink" strokeDasharray="452" strokeDashoffset="58" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #06B6D4)' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-space font-bold tracking-tight">87%</span>
                  <span className="text-[10px] text-neon-pink uppercase tracking-widest mt-1">High Priority</span>
                </div>
              </div>
              <div className="mt-6 text-xs text-center text-indigo-950/50 leading-relaxed">
                Matches Skilling Visa Type-A & Skilled Worker criteria.
              </div>
            </div>

            <div className="glass-card tilt-card absolute bottom-10 left-0 w-80 p-8 bounce-float z-20 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.3)]" style={{ animationDelay: '-3.5s' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40">
                   <Icon icon="lucide:map" className="text-indigo-400" />
                </div>
                <span className="font-space font-bold text-lg">Your Roadmap</span>
              </div>
              <div className="space-y-8">
                <div className="flex gap-5 relative group">
                  <div className="absolute left-3.5 top-7 bottom-0 w-[2px] bg-gradient-to-b from-neon-pink to-indigo-bloom/10 transition-all group-hover:from-cyan-400"></div>
                  <div className="w-7 h-7 rounded-full bg-neon-pink flex-shrink-0 flex items-center justify-center z-10 shadow-[0_0_15px_#06B6D4]">
                    <Icon icon="lucide:check" className="text-indigo-bloom text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">Eligibility Check</span>
                    <span className="text-[11px] text-indigo-900/40 uppercase font-mono tracking-tighter">VERIFIED MAR 2024</span>
                  </div>
                </div>
                <div className="flex gap-5 relative group">
                  <div className="absolute left-3.5 top-7 bottom-0 w-[2px] bg-white/5"></div>
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex-shrink-0 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-indigo-400">Document Intelligence</span>
                    <span className="text-[11px] text-indigo-900/40 italic font-mono">SCANNING... 64%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card tilt-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] overflow-hidden bounce-float z-40 shadow-[0_40px_80px_-20px_rgba(139,92,246,0.3)]" style={{ animationDelay: '-0.5s' }}>
              <div className="bg-gradient-to-r from-neon-pink to-indigo-bloom p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
                  <Icon icon="lucide:cpu" className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-space font-bold">Oracle AI</span>
                  <span className="text-[10px] text-white/70 font-mono uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                  </span>
                </div>
              </div>
              <div className="p-6 bg-white/50 space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-bloom/10 flex items-center justify-center shrink-0 mt-1">
                    <Icon icon="lucide:cpu" className="text-indigo-bloom text-xs" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none p-3 text-sm text-indigo-950 shadow-sm">
                    Based on your travel history, the US O-1A visa has a 88% approval probability if we submit before Q3. Shall we review the required documentation?
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="bg-indigo-bloom text-white rounded-2xl rounded-tr-none p-3 text-sm shadow-sm">
                    Yes, what are the primary requirements?
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-indigo-bloom/10 bg-white/80">
                <div className="relative">
                  <input type="text" placeholder="Type a message..." className="w-full bg-indigo-bloom/5 border border-indigo-bloom/10 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-neon-pink transition-colors" disabled />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-neon-pink rounded-full flex items-center justify-center">
                    <Icon icon="lucide:send" className="text-white text-xs" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="features" className="mt-20 border-y border-indigo-bloom/10 bg-white/20 py-20 relative overflow-hidden backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-space font-bold mb-2">Explore Top Pathways</h2>
              <p className="text-indigo-950/60">AI-curated destinations based on global trends.</p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-indigo-bloom/20 flex items-center justify-center hover:bg-white transition-colors">
                <Icon icon="lucide:arrow-left" />
              </button>
              <button className="w-10 h-10 rounded-full border border-indigo-bloom/20 flex items-center justify-center hover:bg-white transition-colors">
                <Icon icon="lucide:arrow-right" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-6 px-6 overflow-x-auto no-scrollbar pb-8 snap-x snap-mandatory">
            {[
              { country: 'Canada', visa: 'Express Entry', img: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&q=80&w=800', score: 85, time: '6-9 months' },
              { country: 'United Kingdom', visa: 'Skilled Worker', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800', score: 92, time: '3-5 months' },
              { country: 'Japan', visa: 'Highly Skilled Prof.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800', score: 78, time: '2-4 months' },
              { country: 'Australia', visa: 'Subclass 189', img: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=800', score: 88, time: '8-12 months' }
            ].map((item, i) => (
              <div key={i} className="glass-card min-w-[320px] h-[400px] rounded-[32px] overflow-hidden group relative snap-center cursor-pointer">
                <img src={item.img} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt={item.country} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f2e] via-[#1a0f2e]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 text-white font-mono text-sm flex items-center gap-2">
                  <Icon icon="lucide:activity" className="text-neon-pink" /> {item.score}% Match
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <p className="text-neon-pink font-mono text-xs uppercase tracking-widest mb-2">{item.visa}</p>
                  <h3 className="text-3xl font-space font-bold mb-4">{item.country}</h3>
                  <div className="flex items-center gap-4 text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    <span className="flex items-center gap-1"><Icon icon="lucide:clock" /> {item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="pricing" className="relative z-50 w-full px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-10 border-t border-white/10 bg-[#080a0f] mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Node: Global_North_API</span>
          </div>
          <div className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em]">© 2024 VISAPATH PROTOCOL.</div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-mono text-white/40 hover:text-cyan-400 transition-colors uppercase">Privacy</a>
            <a href="#" className="text-[10px] font-mono text-white/40 hover:text-indigo-400 transition-colors uppercase">Terms</a>
            <a href="#" className="text-[10px] font-mono text-white/40 hover:text-purple-400 transition-colors uppercase">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}