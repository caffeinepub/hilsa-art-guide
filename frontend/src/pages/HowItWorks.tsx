import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

const stages = [
  {
    num: '01',
    name: 'Skull Construction',
    icon: '/assets/generated/stage-1-outline.dim_256x256.png',
    description:
      'Begin with a simple circle to represent the skull. Add a vertical centre line and horizontal guide lines dividing the face into thirds — this is the foundation every portrait artist starts with.',
    detail: 'The 1/3 proportion markers help you correctly place the eyes (at the halfway point), the nose (at the two-thirds mark), and the mouth (at the three-quarters mark) before any features are drawn.',
  },
  {
    num: '02',
    name: 'Head Structure',
    icon: '/assets/generated/stage-2-sketch.dim_256x256.png',
    description:
      'Extend the circle into an oval egg shape, then add the jawline and chin. The lower half of the face narrows from the cheekbones down to the pointed chin, giving the head its characteristic form.',
    detail: 'Rough placement guides for the eyes, nose, and mouth are sketched lightly at this stage. The ear is positioned between the eye line and the nose line on the side of the head.',
  },
  {
    num: '03',
    name: 'Feature Blocking',
    icon: '/assets/generated/stage-3-shading.dim_256x256.png',
    description:
      'Block in the major facial features with loose, confident strokes — almond-shaped eyes, the triangular nose, the curved lips, and the ear. The hair mass silhouette is sketched as a single flowing shape.',
    detail: 'At this stage accuracy matters more than neatness. Use the guide lines from Stage 1 to position each feature correctly. The hair is treated as one large dark mass rather than individual strands.',
  },
  {
    num: '04',
    name: 'Light Detail',
    icon: '/assets/generated/stage-4-render.dim_256x256.png',
    description:
      'Refine each facial feature with lighter, more controlled pencil strokes. Begin adding directional hair strand lines flowing from the parting outward. Sketch the neck and shoulder outline to anchor the portrait.',
    detail: 'Light hatching is applied to the shadow side of the face, under the nose, and beneath the lower lip. The eyes gain their irises and lashes. Hair strands follow the natural growth direction.',
  },
  {
    num: '05',
    name: 'Completed Portrait',
    icon: '/assets/generated/stage-5-polish.dim_256x256.png',
    description:
      'The final stage brings everything together — full tonal shading across the face, rich layered hair with individual strand detail, skin texture, and finishing touches like the necklace accessory.',
    detail: 'Multiple layers of hatching and cross-hatching build up the dark values in the hair and shadow areas. The lightest areas of the face are left as bare paper, creating the full range of light to dark that defines a finished pencil portrait.',
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
            A five-stage portrait drawing tutorial that transforms any photograph into a refined pencil artwork — each stage building upon the last.
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
            Upload any photograph and watch it evolve through all five stages of portrait drawing — from skull construction to completed artwork.
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
