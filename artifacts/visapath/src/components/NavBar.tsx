import React from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

type NavBarProps = {
  activeItem?: 'features' | 'assessment' | 'roadmaps' | 'advisor' | 'pricing' | 'results' | null;
};

export default function NavBar({ activeItem = null }: NavBarProps) {
  const [location, navigate] = useLocation();
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const scrollToSection = (id: string) => {
    if (location !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinkClass = (item: string) =>
    `nav-item px-4 py-2 text-sm font-medium transition-all cursor-pointer select-none rounded-full active:scale-[0.95] ${
      activeItem === item
        ? 'text-indigo-bloom bg-indigo-bloom/5'
        : 'text-indigo-950/70 hover:text-indigo-bloom hover:bg-indigo-bloom/5'
    }`;

  return (
    <header className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4">
      <nav className="glass-card relative flex items-center h-14 px-2 py-1 gap-1 border-indigo-bloom/20" style={{ background: 'rgba(248, 246, 255, 0.8)' }}>
        <Link href="/" className="px-4 flex items-center gap-2 group z-10 mr-4">
          <Icon icon="lucide:compass" className="text-neon-pink text-xl group-hover:rotate-180 transition-transform duration-700" />
          <span className="font-space font-bold tracking-tight text-lg">VisaPath AI</span>
        </Link>

        <div className="flex items-center gap-1 z-10">
          <button onClick={() => scrollToSection('features')} className={navLinkClass('features')}>
            Features
          </button>
          <Link href="/assessment" className={navLinkClass('assessment')}>
            Assessment
          </Link>
          <Link href="/roadmaps" className={navLinkClass('roadmaps')}>
            Roadmaps
          </Link>
          <Link href="/advisor" className={navLinkClass('advisor')}>
            AI Advisor
          </Link>
          <button onClick={() => scrollToSection('pricing')} className={navLinkClass('pricing')}>
            Pricing
          </button>
        </div>

        <div className="ml-2 flex items-center gap-2 z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-pink"></span>
          </span>

          {!loading && (
            <div className="ml-1 pl-2 border-l border-indigo-bloom/15">
              {user ? (
                <div className="relative group">
                  <button
                    className="w-7 h-7 rounded-full bg-indigo-bloom text-white text-[10px] font-bold flex items-center justify-center hover:bg-indigo-bloom/80 active:scale-[0.96] transition-all select-none"
                    aria-label="Account menu"
                  >
                    {(user.email ?? 'U')[0].toUpperCase()}
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-44 glass-card py-1 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                    <div className="px-3 py-2 text-[10px] font-mono text-indigo-bloom/50 uppercase tracking-widest truncate border-b border-indigo-bloom/10 mb-1">
                      {user.email}
                    </div>
                    <Link href="/history" className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-indigo-bloom/5 transition-colors">
                      <Icon icon="lucide:history" className="text-indigo-bloom text-xs" />
                      My Assessments
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-indigo-bloom/5 transition-colors text-neon-pink"
                    >
                      <Icon icon="lucide:log-out" className="text-xs" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-bloom text-white text-[10px] font-semibold hover:bg-indigo-bloom/80 active:scale-[0.96] transition-all whitespace-nowrap"
                >
                  <Icon icon="flat-color-icons:google" className="text-xs" />
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
