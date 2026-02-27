import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV'];

const stages = [
  {
    num: '01',
    roman: 'I',
    name: 'Basic Construction',
    description: 'Light sketch lines with face/head outline and construction guidelines',
    image: '/assets/generated/stage1-basic-construction.dim_800x800.png',
  },
  {
    num: '02',
    roman: 'II',
    name: 'Refined Line Art',
    description: 'Clean darker outlines with defined eyes, nose, lips, and hair shape',
    image: '/assets/generated/stage2-refined-lineart.dim_800x800.png',
  },
  {
    num: '03',
    roman: 'III',
    name: 'Hair & Detail Development',
    description: 'Hair strand direction lines, eyebrow/eye details, and light contour shading',
    image: '/assets/generated/stage3-hair-detail.dim_800x800.png',
  },
  {
    num: '04',
    roman: 'IV',
    name: 'Final Shaded Portrait',
    description: 'Fully rendered graphite shading with smooth blending and hair volume',
    image: '/assets/generated/stage4-final-shaded.dim_800x800.png',
  },
];

export default function HowItWorks() {
  return (
    <div className="pt-16">
      {/* Page Header */}
      <section className="py-20 px-6 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-label mb-4">The Method</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
            How It <span className="italic text-gold">Works</span>
          </h1>
          <div className="ink-divider w-24 mx-auto mb-6" />
          <p className="font-cormorant text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
            A four-stage portrait drawing tutorial that transforms any photograph into a refined pencil artwork — each stage building upon the last.
          </p>
        </div>
      </section>

      {/* Stages — New layout with Roman numerals, numeric badges, and generated images */}
      <section className="py-16 px-4 md:px-6 bg-[#f5f3ef]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stages.map((stage, index) => (
              <div
                key={stage.num}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
              >
                {/* Stage image */}
                <div className="relative w-full aspect-square overflow-hidden bg-[#f0ece0]">
                  <img
                    src={stage.image}
                    alt={`Step ${stage.roman}: ${stage.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0ece0;">
                            <span style="font-size:4rem;opacity:0.2">✏️</span>
                          </div>`;
                      }
                    }}
                  />
                  {/* Numeric badge overlay */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center">
                    <span className="font-sans text-sm font-bold leading-none">{stage.num}</span>
                  </div>
                </div>

                {/* Card text content */}
                <div className="px-6 py-5 flex flex-col gap-1">
                  {/* Roman numeral step label */}
                  <p className="font-sans text-xs font-semibold tracking-widest uppercase text-gold">
                    Step {stage.roman}
                  </p>
                  {/* Stage title */}
                  <h2 className="font-serif text-xl font-bold text-foreground leading-snug">
                    {stage.name}
                  </h2>
                  {/* Stage description */}
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-background border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="section-label mb-4">Ready to Begin?</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Transform Your Portrait
          </h2>
          <div className="ink-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8 max-w-md mx-auto">
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
