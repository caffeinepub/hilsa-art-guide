import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

const stages = [
  {
    num: '01',
    name: 'Basic Outline',
    icon: '/assets/generated/stage-1-outline.dim_256x256.png',
    description:
      'The AI analyzes your photograph and extracts the fundamental contour lines. Every subject is reduced to its essential silhouette — clean, precise, and full of potential.',
    detail: 'Edge detection algorithms identify the primary shapes and boundaries within your image, creating a crisp line drawing that forms the foundation of your artwork.',
  },
  {
    num: '02',
    name: 'Reference Sketch',
    icon: '/assets/generated/stage-2-sketch.dim_256x256.png',
    description:
      'Loose, expressive pencil strokes are layered over the outline. The sketch breathes life into the composition, capturing gesture, movement, and the artist\'s hand.',
    detail: 'Hatching patterns and gestural marks are applied to suggest form and texture, mimicking the exploratory quality of a traditional artist\'s reference drawing.',
  },
  {
    num: '03',
    name: 'Shading',
    icon: '/assets/generated/stage-3-shading.dim_256x256.png',
    description:
      'Graduated tones and soft shadows are introduced, transforming flat lines into three-dimensional forms. Light and dark dance across the surface.',
    detail: 'Tonal mapping derived from the original photograph guides the placement of shadows and highlights, creating convincing depth and volume.',
  },
  {
    num: '04',
    name: 'Render & Detail',
    icon: '/assets/generated/stage-4-render.dim_256x256.png',
    description:
      'Fine details emerge — textures, micro-expressions, intricate patterns. The artwork gains its unique character and visual complexity.',
    detail: 'High-frequency detail passes add texture, refine edges, and introduce the subtle nuances that distinguish a polished illustration from a rough sketch.',
  },
  {
    num: '05',
    name: 'Polish & Final Touches',
    icon: '/assets/generated/stage-5-polish.dim_256x256.png',
    description:
      'The final stage unifies all elements. Color harmonics, tonal balance, and subtle luminosity adjustments bring the artwork to its completed, gallery-ready state.',
    detail: 'Global adjustments to contrast, saturation, and edge clarity ensure the final piece is cohesive, vibrant, and ready to be shared or printed.',
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
            A five-stage artistic pipeline that transforms any photograph into a refined work of art — each stage building upon the last.
          </p>
        </div>
      </section>

      {/* Stages — Vertical Timeline */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-0">
            {stages.map((stage, index) => (
              <div key={stage.num} className="relative">
                {/* Connector line */}
                {index < stages.length - 1 && (
                  <div className="absolute left-8 md:left-1/2 top-full w-px h-12 bg-border -translate-x-1/2 z-0" />
                )}

                <div
                  className={`relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 py-10 ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Stage Icon & Number */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center overflow-hidden shadow-art hover:border-gold transition-colors duration-300 group">
                      <img
                        src={stage.icon}
                        alt={stage.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="font-serif text-xl font-bold text-gold">${stage.num}</span>`;
                          }
                        }}
                      />
                    </div>
                    <span className="section-label">{stage.num}</span>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-card border border-border p-8 shadow-art hover:shadow-art-lg transition-shadow duration-300 stage-card-hover">
                    <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3">
                      {stage.name}
                    </h2>
                    <div className="ink-divider w-16 mb-4" />
                    <p className="font-cormorant text-lg text-foreground/80 leading-relaxed mb-3">
                      {stage.description}
                    </p>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                      {stage.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Flow (Desktop Visual) */}
      <section className="py-16 px-6 bg-secondary/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-label mb-3">At a Glance</p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              The Transformation Flow
            </h2>
          </div>

          {/* Horizontal flow — desktop */}
          <div className="hidden md:flex items-center justify-between gap-2">
            {stages.map((stage, i) => (
              <div key={stage.num} className="flex items-center gap-2 flex-1">
                <div className="flex-1 flex flex-col items-center text-center p-4 bg-card border border-border hover:border-gold transition-colors duration-200">
                  <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mb-3 overflow-hidden">
                    <img
                      src={stage.icon}
                      alt={stage.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="font-serif text-sm font-bold text-gold">${stage.num}</span>`;
                        }
                      }}
                    />
                  </div>
                  <p className="section-label text-xs mb-1">{stage.num}</p>
                  <p className="font-serif text-xs font-semibold text-foreground">{stage.name}</p>
                </div>
                {i < stages.length - 1 && (
                  <ArrowRight size={16} className="text-gold flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Vertical flow — mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {stages.map((stage, i) => (
              <div key={stage.num} className="flex flex-col items-center">
                <div className="w-full flex items-center gap-4 p-4 bg-card border border-border">
                  <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={stage.icon}
                      alt={stage.name}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="font-serif text-xs font-bold text-gold">${stage.num}</span>`;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <p className="section-label text-xs mb-0.5">{stage.num}</p>
                    <p className="font-serif text-sm font-semibold text-foreground">{stage.name}</p>
                  </div>
                </div>
                {i < stages.length - 1 && (
                  <div className="w-px h-4 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-background text-center">
        <div className="max-w-xl mx-auto">
          <p className="section-label mb-4">Ready to Begin?</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Transform Your First Photo
          </h2>
          <div className="ink-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground font-sans text-sm mb-8 leading-relaxed">
            Upload any photograph and watch it evolve through all five stages of artistic transformation.
          </p>
          <Link to="/" className="btn-primary-art inline-flex items-center gap-2">
            Upload a Photo
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
