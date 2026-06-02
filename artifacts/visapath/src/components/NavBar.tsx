import React from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'wouter';

type NavBarProps = {
  activeItem?: 'features' | 'assessment' | 'roadmaps' | 'advisor' | 'pricing' | 'results' | null;
};

export default function NavBar({ activeItem = null }: NavBarProps) {
  const [location, navigate] = useLocation();

  const scrollToSection = (id: string) => {
    if (location !== '/') {
      navigate('/');
      // Give wouter time to render the landing page before scrolling
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinkClass = (item: string) =>
    `nav-item px-4 py-2 text-sm font-medium transition-all cursor-pointer select-none ${
      activeItem === item
        ? 'text-indigo-bloom bg-indigo-bloom/5 rounded-full'
        : 'text-indigo-950/70 hover:text-indigo-bloom'
    }`;

  return (
    <header className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4">
      <nav className="glass-card relative flex items-center h-14 px-2 py-1 gap-1 border-indigo-bloom/20" style={{ background: 'rgba(248, 246, 255, 0.8)' }}>
        <Link href="/" className="px-4 flex items-center gap-2 group z-10 mr-4">
          <Icon icon="lucide:compass" className="text-neon-pink text-xl group-hover:rotate-180 transition-transform duration-700" />
          <span className="font-space font-bold tracking-tight text-lg">VisaPath AI</span>
        </Link>

        <div className="flex items-center gap-1 z-10">
          <button
            onClick={() => scrollToSection('features')}
            className={navLinkClass('features')}
          >
            Features
          </button>
          <Link href="/assessment" className={navLinkClass('assessment')}>
            Assessment
          </Link>
          <Link href="/results" className={navLinkClass('roadmaps')}>
            Roadmaps
          </Link>
          <Link href="/advisor" className={navLinkClass('advisor')}>
            AI Advisor
          </Link>
          <button
            onClick={() => scrollToSection('pricing')}
            className={navLinkClass('pricing')}
          >
            Pricing
          </button>
        </div>

        <div className="ml-4 flex items-center gap-3 z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-pink"></span>
          </span>
          <Link
            href="/assessment"
            className="text-xs font-mono tracking-widest uppercase opacity-80 hover:opacity-100 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}
