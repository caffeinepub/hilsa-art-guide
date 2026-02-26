import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowDown, Sparkles } from 'lucide-react';
import UploadInterface from '../components/UploadInterface';

const stages = [
  { num: '01', name: 'Skull Construction' },
  { num: '02', name: 'Head Structure' },
  { num: '03', name: 'Feature Blocking' },
  { num: '04', name: 'Light Detail' },
  { num: '05', name: 'Completed Portrait' },
];

const stageDetails = [
  {
    num: '01',
    name: 'Skull Construction',
    desc: 'Draw a circle with 1/3 proportion guide lines and a centre cross to map the skull',
    img: '/assets/generated/sketch-stage-1.dim_600x600.png',
    fallbackImg: '/assets/generated/stage1-basic-outline.dim_800x800.png',
  },
  {
    num: '02',
    name: 'Head Structure',
    desc: 'Add the oval face shape, jawline, and chin over the skull construction circle',
    img: '/assets/generated/sketch-stage-2.dim_600x600.png',
    fallbackImg: '/assets/generated/stage2-reference-sketch.dim_800x800.png',
  },
  {
    num: '03',
    name: 'Feature Blocking',
    desc: 'Block in rough eyes, nose, lips, ear, and the hair mass silhouette with loose strokes',
    img: '/assets/generated/sketch-stage-3.dim_600x600.png',
    fallbackImg: '/assets/generated/stage3-shading.dim_800x800.png',
  },
  {
    num: '04',
    name: 'Light Detail',
    desc: 'Refine facial features with light pencil shading, hair strand lines, and neck outline',
    img: '/assets/generated/sketch-stage-4.dim_600x600.png',
    fallbackImg: '/assets/generated/stage4-render-detail.dim_800x800.png',
  },
  {
    num: '05',
    name: 'Completed Portrait',
    desc: 'Full pencil portrait with complete shading, rich hair detail, and necklace accessory',
    img: '/assets/generated/sketch-stage-5.dim_600x600.png',
    fallbackImg: '/assets/generated/stage5-polish-final.dim_800x800.png',
  },
];

export default function Home() {
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/generated/hero-bg.dim_1920x1080.png')" }}
        />
        {/* Overlay */}
        <div className="hero-overlay absolute inset-0" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gold opacity-70" />
            <span className="section-label text-gold opacity-90">AI-Powered Art Transformation</span>
            <div className="h-px w-12 bg-gold opacity-70" />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6">
            Transform Your
            <br />
            <span className="italic text-gold">Photo into Art</span>
          </h1>

          <p className="font-cormorant text-xl md:text-2xl text-white/80 leading-relaxed mb-4 max-w-2xl mx-auto">
            Watch your photograph evolve through five distinct artistic stages — from raw outline to polished masterpiece.
          </p>

          {/* Stage Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {stages.map((s, i) => (
              <span
                key={s.num}
                className="text-xs font-sans font-medium tracking-widest uppercase text-white/60 px-3 py-1 border border-white/20"
              >
                {s.num} {s.name}
                {i < stages.length - 1 && <span className="ml-2 text-gold/60">→</span>}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={scrollToUpload} className="btn-primary-art flex items-center gap-2">
              <Sparkles size={14} />
              Upload Your Photo
            </button>
            <Link to="/how-it-works" className="btn-outline-art text-white border-white/40 hover:border-gold hover:text-gold">
              How It Works
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToUpload}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-gold transition-colors animate-bounce"
          aria-label="Scroll down"
        >
          <ArrowDown size={20} />
        </button>
      </section>

      {/* Upload Section */}
      <section ref={uploadRef} className="py-20 px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Begin Your Journey</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Upload Your Photo
            </h2>
            <div className="ink-divider w-24 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-md mx-auto">
              Select any photograph and our pipeline will guide it through five progressive artistic stages, revealing the artwork within.
            </p>
          </div>
          <UploadInterface />
        </div>
      </section>

      {/* Stage Preview Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">The Process</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Five Stages of Portrait Drawing
            </h2>
            <div className="ink-divider w-24 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans text-sm max-w-lg mx-auto">
              Every portrait passes through these five carefully crafted tutorial stages, each building more depth, detail, and artistic character.
            </p>
          </div>

          {/* Stage preview grid — 5 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {stageDetails.map((stage, i) => (
              <div
                key={stage.num}
                className="flex flex-col items-center group stage-card-hover"
              >
                {/* Preview image card */}
                <div
                  className="relative w-full overflow-hidden rounded-lg border border-border shadow-art group-hover:border-gold transition-colors duration-300 mb-3"
                  style={{ aspectRatio: '1 / 1', background: '#f0ece0' }}
                >
                  <img
                    src={stage.img}
                    alt={`Stage ${stage.num} — ${stage.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Try fallback image
                      if (target.src !== stage.fallbackImg) {
                        target.src = stage.fallbackImg;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                  {/* Stage number overlay */}
                  <div className="absolute top-2 left-2 bg-ink/70 text-white text-xs font-mono px-1.5 py-0.5 rounded">
                    {stage.num}
                  </div>
                  {/* Connector line (desktop only) */}
                  {i < stageDetails.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border -translate-y-1/2 z-10" />
                  )}
                </div>

                {/* Stage label */}
                <p className="section-label text-center mb-1">{stage.num}</p>
                <h3 className="font-serif text-sm font-semibold text-foreground text-center mb-1">
                  {stage.name}
                </h3>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed text-center">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/how-it-works" className="btn-outline-art inline-block">
              Explore the Full Process
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
