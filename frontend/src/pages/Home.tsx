import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowDown, Sparkles } from 'lucide-react';
import UploadInterface from '../components/UploadInterface';
import { STAGES } from '../lib/pencilSketchUtils';

// Per-stage visual identity for hero pills — unified graphite/sketch palette
const STAGE_PILL_STYLES = [
  // Stage 1: Basic Construction — barely-there, ghost light
  'border border-dashed border-white/25 text-white/45 bg-white/5',
  // Stage 2: Refined Line Art — clean structural, slightly more visible
  'border border-white/35 text-white/60 bg-white/8',
  // Stage 3: Hair & Detail Development — warm graphite mid-tone
  'border border-stone-300/40 text-stone-100/70 bg-stone-50/8',
  // Stage 4: Final Shaded Portrait — gold premium, finished masterpiece
  'border border-gold/60 text-gold bg-gold/10',
];

// Sketchbook card styles for the stage preview grid
const STAGE_CARD_STYLES = [
  {
    card: 'bg-stone-50/60 border border-dashed border-stone-300/60',
    imgWrapper: 'border border-dashed border-stone-300/70',
    numBadge: 'bg-stone-400/70 text-white',
    accent: 'text-stone-500',
    label: 'text-stone-400/80 tracking-[0.22em]',
    dot: 'bg-stone-300',
    tag: 'Step I',
  },
  {
    card: 'bg-stone-50/70 border border-stone-300/70',
    imgWrapper: 'border border-stone-300',
    numBadge: 'bg-stone-500/80 text-white',
    accent: 'text-stone-600',
    label: 'text-stone-500/70 tracking-[0.2em]',
    dot: 'bg-stone-400',
    tag: 'Step II',
  },
  {
    card: 'bg-amber-50/50 border border-stone-300/60',
    imgWrapper: 'border border-stone-400/50',
    numBadge: 'bg-stone-600/70 text-amber-50',
    accent: 'text-stone-700',
    label: 'text-stone-600/65 tracking-[0.18em]',
    dot: 'bg-stone-500/60',
    tag: 'Step III',
  },
  {
    card: 'bg-amber-50/70 border border-gold/40',
    imgWrapper: 'border border-gold/50',
    numBadge: 'bg-gold/80 text-ink',
    accent: 'text-gold',
    label: 'text-gold/80 tracking-[0.15em]',
    dot: 'bg-gold',
    tag: 'Step IV',
  },
];

// Stage preview images — use the generated sketch stage assets
const STAGE_IMAGES = [
  {
    img: '/assets/generated/sketch-stage-1.dim_600x600.png',
    fallback: '/assets/generated/stage1-trace-outlines.dim_600x600.png',
  },
  {
    img: '/assets/generated/sketch-stage-2.dim_600x600.png',
    fallback: '/assets/generated/stage2-basic-elements.dim_600x600.png',
  },
  {
    img: '/assets/generated/sketch-stage-3.dim_600x600.png',
    fallback: '/assets/generated/stage3-slight-shading.dim_600x600.png',
  },
  {
    img: '/assets/generated/sketch-stage-4.dim_600x600.png',
    fallback: '/assets/generated/stage4-render-detail.dim_600x600.png',
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
            Watch your photograph evolve through four progressive pencil drawing stages — from light construction lines to a fully shaded portrait masterpiece.
          </p>

          {/* Stage Pills — graphite/sketch palette */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {STAGES.map((stage, i) => (
              <span
                key={stage.number}
                className={`text-xs font-sans font-medium tracking-widest uppercase px-3 py-1 transition-all duration-200 ${STAGE_PILL_STYLES[i]}`}
              >
                <span className="opacity-55 mr-1">0{stage.number}</span>
                <span>{stage.name}</span>
                {i < STAGES.length - 1 && (
                  <span className="ml-2 text-white/25">→</span>
                )}
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
              Select any photograph and our pipeline will guide it through four progressive pencil drawing stages, revealing the artwork within.
            </p>
          </div>
          <UploadInterface />
        </div>
      </section>

      {/* Stage Preview Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">The Process</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Four Stages of Pencil Drawing
            </h2>
            <div className="ink-divider w-24 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans text-sm max-w-lg mx-auto">
              Every portrait passes through these four carefully crafted pencil drawing stages, each building more depth, detail, and artistic character.
            </p>
          </div>

          {/* Stage preview grid — 4 cards in 2x2 layout, sketchbook aesthetic */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {STAGES.map((stage, i) => {
              const style = STAGE_CARD_STYLES[i];
              const imgData = STAGE_IMAGES[i];
              return (
                <div
                  key={stage.number}
                  className={`flex flex-col items-center group stage-card-hover rounded-sm p-3 transition-all duration-300 ${style.card}`}
                >
                  {/* Stage tag */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className={`text-[0.6rem] font-sans font-semibold tracking-[0.22em] uppercase ${style.label}`}>
                      {style.tag}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  </div>

                  {/* Preview image card */}
                  <div
                    className={`relative w-full overflow-hidden rounded-sm shadow-art mb-3 transition-all duration-300 ${style.imgWrapper}`}
                    style={{ aspectRatio: '1 / 1', background: '#f5f0e8' }}
                  >
                    <img
                      src={imgData.img}
                      alt={`Step ${stage.number} — ${stage.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== imgData.fallback) {
                          target.src = imgData.fallback;
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                    {/* Stage number overlay */}
                    <div className={`absolute top-2 left-2 text-xs font-mono px-1.5 py-0.5 rounded-sm ${style.numBadge}`}>
                      0{stage.number}
                    </div>
                    {/* Connector line (desktop only) */}
                    {i < STAGES.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border -translate-y-1/2 z-10" />
                    )}
                  </div>

                  {/* Stage label */}
                  <h3 className={`font-serif text-sm font-semibold text-center mb-1 ${style.accent}`}>
                    {stage.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans leading-relaxed text-center">
                    {stage.description}
                  </p>
                </div>
              );
            })}
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
