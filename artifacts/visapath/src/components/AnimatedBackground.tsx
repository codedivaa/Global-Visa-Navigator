export default function AnimatedBackground() {
  return (
    <>
      <div className="gooey-wrapper">
        <div className="gradients-container">
          <div className="blob b1"></div>
          <div className="blob b2"></div>
          <div className="blob b3"></div>
          <div className="blob b4"></div>
          <div className="interactive-blob" />
        </div>
      </div>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 1000 500" className="w-full h-full text-indigo-bloom/10">
          <path d="M150,150 Q250,100 350,150" fill="none" stroke="url(#grad1)" strokeWidth="1.5" className="map-path opacity-40" />
          <path d="M200,350 Q450,200 700,100" fill="none" stroke="url(#grad1)" strokeWidth="1.5" className="map-path opacity-60" />
          <path d="M220,380 Q500,250 850,250" fill="none" stroke="url(#grad1)" strokeWidth="1.5" className="map-path opacity-50" />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#f42272', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#f42272', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#601b9d', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <circle cx="150" cy="150" r="3" fill="#06B6D4" className="animate-pulse" />
          <circle cx="700" cy="100" r="3" fill="#6366F1" className="animate-pulse" />
          <circle cx="850" cy="250" r="3" fill="#8B5CF6" className="animate-pulse" />
        </svg>
      </div>
    </>
  );
}