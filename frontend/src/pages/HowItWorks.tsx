import { Link } from "@tanstack/react-router";
import { Pencil, Layers, Zap, Eye, Sparkles } from "lucide-react";

const STAGES = [
  {
    number: 1,
    name: "Basic Outline",
    icon: Pencil,
    img: "/assets/generated/stage-1-outline.dim_256x256.png",
    shortDesc: "Clean thin graphite-grey outlines on pure white background.",
    longDesc:
      "Sobel edge detection extracts the structural lines of your photo — thin, clean graphite-grey strokes on a pure white background. No shading, no fill. Just the essential contours that define the subject.",
  },
  {
    number: 2,
    name: "Light Hatching",
    icon: Layers,
    img: "/assets/generated/stage-2-sketch.dim_256x256.png",
    shortDesc: "Directional hatching strokes suggest form and light.",
    longDesc:
      "Single-direction hatching lines are drawn at 45° in the darker regions of the image. These strokes begin to suggest the direction of light and the three-dimensional form of the subject.",
  },
  {
    number: 3,
    name: "Cross-Hatching",
    icon: Zap,
    img: "/assets/generated/stage-3-shading.dim_256x256.png",
    shortDesc: "Intersecting lines build mid-tones and depth.",
    longDesc:
      "A second layer of hatching crosses the first at a perpendicular angle. The intersection of these lines creates mid-tones and begins to give the drawing real tonal depth and three-dimensionality.",
  },
  {
    number: 4,
    name: "Deep Shading",
    icon: Eye,
    img: "/assets/generated/stage-4-render.dim_256x256.png",
    shortDesc: "Dense tonal layers push shadows into darkness.",
    longDesc:
      "Multiple dense hatching layers in different directions are combined with a tonal fill layer. Shadow regions become significantly darker, revealing the full volume and texture of the subject.",
  },
  {
    number: 5,
    name: "Finished Portrait",
    icon: Sparkles,
    img: "/assets/generated/stage-5-polish.dim_256x256.png",
    shortDesc: "Near-black shadows, bright white highlights — fully rendered.",
    longDesc:
      "The final stage applies aggressive tone mapping with near-black shadows (approaching #1a1a1a) and preserved bright white highlights. Four layers of hatching at varied angles create the rich, complex texture of a fully rendered traditional pencil drawing.",
  },
];

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            THE TECHNIQUE
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6">
            The Pencil Sketch Pipeline
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every photo goes through 5 carefully crafted stages — each one
            building on the last to produce a progressively richer pencil
            drawing, from clean outlines to deep, fully-rendered shading.
          </p>
        </div>
      </section>

      {/* Stages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isEven = idx % 2 === 0;
            return (
              <div
                key={stage.number}
                className={`flex flex-col md:flex-row gap-8 items-center ${
                  isEven ? "" : "md:flex-row-reverse"
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-48 flex-shrink-0">
                  <div className="stage-card overflow-hidden aspect-square">
                    <img
                      src={stage.img}
                      alt={`Stage ${stage.number}: ${stage.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-card text-primary text-4xl font-serif font-bold">${stage.number}</div>`;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="stage-label">STAGE {stage.number}</p>
                      <h3 className="text-card-foreground font-semibold text-lg font-serif">
                        {stage.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium mb-2">
                    {stage.shortDesc}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {stage.longDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* At a Glance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              AT A GLANCE
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              The Pencil Sketch Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.number}
                  className="bg-card border border-border rounded-lg p-4 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <p className="stage-label mb-1">STAGE {stage.number}</p>
                  <p className="text-card-foreground font-semibold text-sm">
                    {stage.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Ready to Try It?
          </h2>
          <p className="text-muted-foreground mb-8">
            Upload your photo and watch the pencil sketch transformation happen
            in real time — all 5 stages, right in your browser.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3 rounded transition-all duration-200 hover:opacity-90"
          >
            <Pencil size={18} />
            Start Your Pencil Sketch
          </Link>
        </div>
      </section>
    </main>
  );
}
