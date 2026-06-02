import bgEducation from '@/assets/bg-education.png';
import bgAi from '@/assets/bg-ai.png';
import bgInnovation from '@/assets/bg-innovation.png';
import bgCareer from '@/assets/bg-career.png';
import bgGlobe from '@/assets/bg-globe.png';

const BG_IMAGES = [
  {
    id: 'education',
    src: bgEducation,
    size: 200,
    top: '-2%', left: '-3%',
    anim: 'floatCard1', delay: '0s', dur: '20s',
    opacity: 0.13,
    hue: 270,
  },
  {
    id: 'innovation',
    src: bgInnovation,
    size: 190,
    top: '-4%', right: '-2%',
    anim: 'floatCard3', delay: '-4s', dur: '18s',
    opacity: 0.12,
    hue: 300,
  },
  {
    id: 'ai',
    src: bgAi,
    size: 210,
    top: '38%', right: '-4%',
    anim: 'floatCard5', delay: '-10s', dur: '22s',
    opacity: 0.13,
    hue: 200,
  },
  {
    id: 'career',
    src: bgCareer,
    size: 185,
    top: '55%', left: '-4%',
    anim: 'floatCard2', delay: '-6s', dur: '24s',
    opacity: 0.11,
    hue: 320,
  },
  {
    id: 'globe',
    src: bgGlobe,
    size: 195,
    bottom: '-4%', right: '12%',
    anim: 'floatCard4', delay: '-14s', dur: '26s',
    opacity: 0.12,
    hue: 160,
  },
];

export default function AnimatedBackground() {
  return (
    <>
      {/* Blob gooey layer */}
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

      {/* 3D floating background illustrations — very low opacity, pushed to edges */}
      <div className="fixed inset-0 z-[5] pointer-events-none" style={{ perspective: '1400px' }}>
        {BG_IMAGES.map(img => (
          <div
            key={img.id}
            className="float-card-3d"
            style={{
              position: 'absolute',
              top: img.top,
              left: (img as { left?: string }).left,
              right: (img as { right?: string }).right,
              bottom: (img as { bottom?: string }).bottom,
              width: img.size,
              height: img.size,
              animationName: img.anim,
              animationDelay: img.delay,
              animationDuration: img.dur,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          >
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: img.opacity,
                filter: `blur(1.5px) hue-rotate(${img.hue}deg) saturate(1.4) brightness(0.95)`,
                userSelect: 'none',
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
