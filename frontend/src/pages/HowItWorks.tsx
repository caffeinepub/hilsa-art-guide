import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV'];

const stages = [
  {
    roman: 'I',
    name: 'Basic Construction',
    description: 'Light sketch lines with face/head outline and construction guidelines',
    image: '/assets/generated/stage1-sketch.dim_600x600.png',
    fallback: '/assets/generated/stage1-basic-construction.dim_800x800.png',
  },
  {
    roman: 'II',
    name: 'Refined Line Art',
    description: 'Clean darker outlines with defined eyes, nose, lips, and hair shape',
    image: '/assets/generated/stage2-sketch.dim_600x600.png',
    fallback: '/assets/generated/stage2-refined-lineart.dim_800x800.png',
  },
  {
    roman: 'III',
    name: 'Hair & Detail Development',
    description: 'Hair strand direction lines, eyebrow/eye details, and light contour shading',
    image: '/assets/generated/stage3-sketch.dim_600x600.png',
    fallback: '/assets/generated/stage3-hair-detail.dim_800x800.png',
  },
  {
    roman: 'IV',
    name: 'Final Shaded Portrait',
    description: 'Fully rendered graphite shading with smooth blending and hair volume',
    image: '/assets/generated/stage4-sketch.dim_600x600.png',
    fallback: '/assets/generated/stage4-final-shaded.dim_800x800.png',
  },
];

export default function HowItWorks() {
  return (
    <div className="pt-16 bg-paper min-h-screen">
      {/* Page Header — editorial, minimal */}
      <section className="py-16 px-6 bg-paper border-b border-paper-rule">
        <div className="max-w-2xl mx-auto text-center">
          <p className="sketch-label mb-3">The Method</p>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-graphite mb-5 tracking-tight">
            How It <em>Works</em>
          </h1>
          <div className="ink-divider w-20 mx-auto mb-5" />
          <p className="font-cormorant text-lg text-graphite-light leading-relaxed max-w-lg mx-auto">
            A four-stage portrait drawing tutorial that transforms any photograph into a refined pencil artwork — each stage building upon the last.
          </p>
        </div>
      </section>

      {/* ── 2×2 Tutorial Grid — matches reference image exactly ── */}
      <section className="py-12 px-4 md:px-8 bg-paper">
        <div className="max-w-4xl mx-auto">

          {/* Grid container — thin rule dividers, no card borders */}
          <div
            className="w-full overflow-hidden"
            style={{ border: '1px solid #c8c0b0' }}
          >
            <div
              className="grid grid-cols-2"
              style={{ gap: '1px', background: '#c8c0b0' }}
            >
              {stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="relative bg-paper-warm group"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {/* Stage image */}
                  <img
                    src={stage.image}
                    alt={`Stage ${stage.roman}: ${stage.name}`}
                    className="w-full h-full object-cover block"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Try fallback image
                      if (target.src !== stage.fallback) {
                        target.src = stage.fallback;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />

                  {/* Roman numeral overlay — top-left, serif, muted graphite */}
                  <div className="absolute top-3 left-4 pointer-events-none">
                    <span
                      className="font-serif text-2xl md:text-3xl font-normal leading-none select-none"
                      style={{ color: 'rgba(60, 52, 42, 0.55)' }}
                    >
                      {stage.roman}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage captions below grid — small-caps serif, no colored backgrounds */}
          <div className="grid grid-cols-2 gap-0 mt-0" style={{ borderLeft: '1px solid #c8c0b0', borderRight: '1px solid #c8c0b0', borderBottom: '1px solid #c8c0b0' }}>
            {stages.map((stage, idx) => (
              <div
                key={idx}
                className={`px-5 py-4 ${idx % 2 === 0 ? 'border-r' : ''} ${idx < 2 ? 'border-b' : ''}`}
                style={{ borderColor: '#c8c0b0' }}
              >
                <p className="sketch-stage-label mb-1">
                  Stage {stage.roman}
                </p>
                <h3 className="font-serif text-base font-normal text-graphite leading-snug mb-1">
                  {stage.name}
                </h3>
                <p className="font-cormorant text-sm text-graphite-light leading-relaxed">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-paper border-t border-paper-rule">
        <div className="max-w-xl mx-auto text-center">
          <p className="sketch-label mb-3">Ready to Begin?</p>
          <h2 className="font-serif text-3xl font-normal text-graphite mb-4">
            Transform Your Portrait
          </h2>
          <div className="ink-divider w-20 mx-auto mb-6" />
          <p className="font-cormorant text-base text-graphite-light leading-relaxed mb-8 max-w-md mx-auto">
            Upload any photograph and watch it transform through all four portrait drawing stages — from the first construction sketch to the final polished artwork.
          </p>
          <Link to="/" className="btn-primary-art inline-flex items-center gap-2">
            <ArrowRight size={14} />
            Start Creating
          </Link>
        </div>
      </section>
    </div>
  );
}
