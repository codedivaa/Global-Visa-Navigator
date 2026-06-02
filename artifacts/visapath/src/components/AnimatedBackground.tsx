import { Icon } from '@iconify/react';

const FLOAT_CARDS = [
  {
    id: 'study',
    icon: 'lucide:graduation-cap',
    label: 'Education',
    iconColor: '#8b5cf6',
    bg: 'rgba(139,92,246,0.09)',
    border: 'rgba(139,92,246,0.20)',
    glow: 'rgba(139,92,246,0.12)',
    top: '22%', left: '3%',
    anim: 'floatCard1', delay: '0s', dur: '16s',
    barW: 32,
  },
  {
    id: 'career',
    icon: 'lucide:briefcase',
    label: 'Career',
    iconColor: '#f42272',
    bg: 'rgba(244,34,114,0.08)',
    border: 'rgba(244,34,114,0.18)',
    glow: 'rgba(244,34,114,0.10)',
    top: '60%', left: '2%',
    anim: 'floatCard2', delay: '-5s', dur: '20s',
    barW: 28,
  },
  {
    id: 'innovation',
    icon: 'lucide:lightbulb',
    label: 'Innovation',
    iconColor: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.20)',
    glow: 'rgba(245,158,11,0.10)',
    top: '13%', right: '3%',
    anim: 'floatCard3', delay: '-3s', dur: '18s',
    barW: 36,
  },
  {
    id: 'tech',
    icon: 'lucide:code-2',
    label: 'Technology',
    iconColor: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.20)',
    glow: 'rgba(6,182,212,0.12)',
    top: '70%', right: '3%',
    anim: 'floatCard4', delay: '-8s', dur: '22s',
    barW: 34,
  },
  {
    id: 'ai',
    icon: 'lucide:cpu',
    label: 'AI & Learning',
    iconColor: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.18)',
    glow: 'rgba(16,185,129,0.10)',
    top: '40%', right: '2%',
    anim: 'floatCard5', delay: '-12s', dur: '24s',
    barW: 30,
  },
  {
    id: 'globe',
    icon: 'lucide:globe',
    label: 'Global Mobility',
    iconColor: '#601b9d',
    bg: 'rgba(96,27,157,0.08)',
    border: 'rgba(96,27,157,0.18)',
    glow: 'rgba(96,27,157,0.10)',
    top: '82%', left: '42%',
    anim: 'floatCard1', delay: '-9s', dur: '26s',
    barW: 40,
  },
];

export default function AnimatedBackground() {
  return (
    <>
      {/* Original blob layer */}
      <div className="gooey-wrapper">
        <div className="gradients-container">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
          <div className="blob b4" />
          <div className="blob b-emerald" />
          <div className="blob b-cyan" />
          <div className="interactive-blob" />
        </div>
      </div>

      {/* Route-map SVG */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   style={{ stopColor: '#f42272', stopOpacity: 0 }} />
              <stop offset="50%"  style={{ stopColor: '#f42272', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#601b9d', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d="M150,150 Q250,100 350,150" fill="none" stroke="url(#grad1)" strokeWidth="1.5" className="map-path opacity-40" />
          <path d="M200,350 Q450,200 700,100" fill="none" stroke="url(#grad1)" strokeWidth="1.5" className="map-path opacity-60" />
          <path d="M220,380 Q500,250 850,250" fill="none" stroke="url(#grad1)" strokeWidth="1.5" className="map-path opacity-50" />
          <circle cx="150" cy="150" r="3" fill="#06B6D4" className="animate-pulse" />
          <circle cx="700" cy="100" r="3" fill="#6366F1" className="animate-pulse" />
          <circle cx="850" cy="250" r="3" fill="#8B5CF6" className="animate-pulse" />
        </svg>
      </div>

      {/* Glass leaf shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="glass-leaf leaf-1" />
        <div className="glass-leaf leaf-2" />
        <div className="glass-leaf leaf-3" />
        <div className="glass-leaf leaf-4" />
        <div className="glass-leaf leaf-5" />
        <div className="glass-leaf leaf-6" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className={`particle particle-${(i % 6) + 1}`} style={{ left: `${(i * 5.7 + 3) % 100}%` }} />
        ))}
      </div>

      {/* 3D floating icon cards — z-[15] so they layer above page content, pointer-events:none */}
      <div
        className="fixed inset-0 z-[15] pointer-events-none"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 40%' }}
      >
        {FLOAT_CARDS.map(card => (
          <div
            key={card.id}
            className="float-card-3d"
            style={{
              position: 'absolute',
              top: card.top,
              left: (card as { left?: string }).left,
              right: (card as { right?: string }).right,
              animationName: card.anim,
              animationDelay: card.delay,
              animationDuration: card.dur,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          >
            <div
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                boxShadow: `0 8px 28px ${card.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: '14px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '138px',
                opacity: 0.82,
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                background: `${card.iconColor}18`,
                border: `1px solid ${card.iconColor}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 10px ${card.iconColor}20`,
              }}>
                <Icon icon={card.icon} style={{ color: card.iconColor, fontSize: 17 }} />
              </div>
              <div>
                <div style={{
                  fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                  color: card.iconColor, opacity: 0.9,
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {card.label}
                </div>
                <div style={{
                  marginTop: 4, width: card.barW, height: 2, borderRadius: 2,
                  background: `linear-gradient(90deg, ${card.iconColor}70, ${card.iconColor}18)`,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
