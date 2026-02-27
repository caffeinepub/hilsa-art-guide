import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { STAGE_LABELS, STAGE_DESCRIPTIONS } from '../lib/pencilSketchUtils';

const stages = [
  {
    num: '01',
    name: STAGE_LABELS[0],
    description: STAGE_DESCRIPTIONS[0],
    image: '/assets/generated/stage1-trace-outlines.dim_600x600.png',
    detail: 'Keep your pencil pressure very light at this stage. The goal is to capture the overall proportions and placement on the page, not to commit to any final lines. These traced outlines will guide every subsequent stage.',
  },
  {
    num: '02',
    name: STAGE_LABELS[1],
    description: STAGE_DESCRIPTIONS[1],
    image: '/assets/generated/stage2-basic-elements.dim_600x600.png',
    detail: 'Use the traced outlines from Stage 1 as anchor points. The eyes sit at the halfway point of the head, the nose at two-thirds, and the mouth at three-quarters. Keep lines clean and deliberate rather than sketchy.',
  },
  {
    num: '03',
    name: STAGE_LABELS[2],
    description: STAGE_DESCRIPTIONS[2],
    image: '/assets/generated/stage3-slight-shading.dim_600x600.png',
    detail: 'Use the side of your pencil tip for soft, broad shading. Work in one direction first, then layer a second pass at a slight angle for smoother tones. Leave the lightest areas of the face completely untouched — bare paper is your brightest highlight.',
  },
  {
    num: '04',
    name: STAGE_LABELS[3],
    description: STAGE_DESCRIPTIONS[3],
    image: '/assets/generated/stage4-render-detail.dim_600x600.png',
    detail: 'Directional strokes are key at this stage. Hair strands should follow the natural growth direction. Facial shading should follow the contours of the planes of the face. Cross-hatching in the darkest areas creates rich, deep tones.',
  },
  {
    num: '05',
    name: STAGE_LABELS[4],
    description: STAGE_DESCRIPTIONS[4],
    image: '/assets/generated/stage5-polish.dim_600x600.png',
    detail: 'Use a blending stump or your fingertip to soften skin tones. Re-sharpen edges around the eyes, lips, and hair outline with a freshly pointed pencil. Step back and assess the overall balance — adjust any areas that feel too light or too dark to complete the portrait.',
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

      {/* Stages — Card-per-step layout matching reference screenshot */}
      <section className="py-12 px-4 md:px-6 bg-[#f5f3ef]">
        <div className="max-w-2xl mx-auto space-y-6">
          {stages.map((stage, index) => (
            <div
              key={stage.num}
              className="bg-white rounded-2xl shadow-md overflow-hidden"
            >
              {/* Card text content */}
              <div className="px-6 pt-6 pb-4">
                <h2 className="font-sans text-2xl font-bold text-gray-900 mb-3 leading-snug">
                  Step {index + 1}: {stage.name}
                </h2>
                <p className="font-sans text-base text-gray-600 leading-relaxed mb-1">
                  {stage.description}
                </p>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">
                  {stage.detail}
                </p>
              </div>

              {/* Stage image — full width inside card */}
              <div className="px-5 pb-5">
                <div className="rounded-xl overflow-hidden bg-[#f0ece0]">
                  <img
                    src={stage.image}
                    alt={`Step ${index + 1}: ${stage.name}`}
                    className="w-full object-cover"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#f0ece0;">
                            <span style="font-size:3rem;opacity:0.3">✏️</span>
                          </div>`;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
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
            Upload any photograph and watch it transform through all five portrait drawing stages — from the first traced outline to the final polished artwork.
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
