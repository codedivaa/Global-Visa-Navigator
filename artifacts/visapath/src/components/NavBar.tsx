import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'wouter';

type NavBarProps = {
  activeItem?: 'features' | 'assessment' | 'roadmaps' | 'advisor' | 'pricing' | 'results' | null;
};

export default function NavBar({ activeItem = null }: NavBarProps) {
  return (
    <header className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4">
      <nav className="glass-card relative flex items-center h-14 px-2 py-1 gap-1 border-indigo-bloom/20" style={{ background: 'rgba(248, 246, 255, 0.8)' }}>
        <Link href="/" className="px-4 flex items-center gap-2 group z-10 mr-4">
          <Icon icon="lucide:compass" className="text-neon-pink text-xl group-hover:rotate-180 transition-transform duration-700" />
          <span className="font-space font-bold tracking-tight text-lg">VisaPath AI</span>
        </Link>

        <div className="flex items-center gap-1 z-10">
          <Link href="/#features" className={`nav-item px-4 py-2 text-sm font-medium transition-all ${activeItem === 'features' ? 'text-indigo-bloom bg-indigo-bloom/5 rounded-full' : 'text-indigo-950/70 hover:text-indigo-bloom'}`}>Features</Link>
          <Link href="/assessment" className={`nav-item px-4 py-2 text-sm font-medium transition-all ${activeItem === 'assessment' ? 'text-indigo-bloom bg-indigo-bloom/5 rounded-full' : 'text-indigo-950/70 hover:text-indigo-bloom'}`}>Assessment</Link>
          <Link href="/#roadmaps" className={`nav-item px-4 py-2 text-sm font-medium transition-all ${activeItem === 'roadmaps' ? 'text-indigo-bloom bg-indigo-bloom/5 rounded-full' : 'text-indigo-950/70 hover:text-indigo-bloom'}`}>Roadmaps</Link>
          <Link href="/advisor" className={`nav-item px-4 py-2 text-sm font-medium transition-all ${activeItem === 'advisor' ? 'text-indigo-bloom bg-indigo-bloom/5 rounded-full' : 'text-indigo-950/70 hover:text-indigo-bloom'}`}>AI Advisor</Link>
          <Link href="/#pricing" className={`nav-item px-4 py-2 text-sm font-medium transition-all ${activeItem === 'pricing' ? 'text-indigo-bloom bg-indigo-bloom/5 rounded-full' : 'text-indigo-950/70 hover:text-indigo-bloom'}`}>Pricing</Link>
        </div>

        <div className="ml-4 flex items-center gap-3 z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-pink"></span>
          </span>
          <Link href="/#login" className="text-xs font-mono tracking-widest uppercase opacity-80 hover:opacity-100 transition-opacity">Sign In</Link>
        </div>
      </nav>
    </header>
  );
}