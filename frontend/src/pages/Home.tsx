import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, Pencil, Layers, Sparkles } from "lucide-react";
import UploadInterface from "@/components/UploadInterface";

const STAGES = [
  {
    number: 1,
    name: "Basic Outline",
    desc: "Clean thin graphite lines on pure white — the skeleton of the drawing.",
    img: "/assets/generated/sketch-stage-1.dim_600x600.png",
  },
  {
    number: 2,
    name: "Light Hatching",
    desc: "Directional strokes begin to suggest form and light direction.",
    img: "/assets/generated/sketch-stage-2.dim_600x600.png",
  },
  {
    number: 3,
    name: "Cross-Hatching",
    desc: "Intersecting lines build mid-tones and three-dimensional depth.",
    img: "/assets/generated/sketch-stage-3.dim_600x600.png",
  },
  {
    number: 4,
    name: "Deep Shading",
    desc: "Dense tonal layers push shadows darker, revealing volume and texture.",
    img: "/assets/generated/sketch-stage-4.dim_600x600.png",
  },
  {
    number: 5,
    name: "Finished Portrait",
    desc: "Near-black shadows, bright white highlights — a fully rendered pencil drawing.",
    img: "/assets/generated/sketch-stage-5.dim_600x600.png",
  },
];

export default function Home() {
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('/assets/generated/hero-bg.dim_1920x1080.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-primary" />
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">
              AI Pencil Sketch
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Transform Your Photo Into a{" "}
            <span className="text-primary">Pencil Masterpiece</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Watch your portrait evolve through 5 progressive stages — from clean
            outlines to richly shaded pencil art with deep shadows and bright
            highlights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToUpload}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3 rounded transition-all duration-200 hover:opacity-90 text-base"
            >
              <Pencil size={18} />
              Start Creating
            </button>
            <Link
              to="/how-it-works"
              className="flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground px-8 py-3 rounded transition-all duration-200 text-base"
            >
              <Layers size={18} />
              How It Works
            </Link>
          </div>

          <button
            onClick={scrollToUpload}
            className="mt-12 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors mx-auto"
          >
            <span className="text-xs tracking-widest uppercase">Upload Photo</span>
            <ArrowDown size={18} className="animate-bounce" />
          </button>
        </div>
      </section>

      {/* Stage Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              THE PROCESS
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              5 Progressive Stages
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each stage builds on the last — from a clean outline to a fully
              rendered pencil drawing with deep, rich shading.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {STAGES.map((stage) => (
              <div key={stage.number} className="stage-card group">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={stage.img}
                    alt={`Stage ${stage.number}: ${stage.name}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-muted-foreground text-4xl font-serif font-bold">${stage.number}</div>`;
                      }
                    }}
                  />
                </div>
                <div className="p-3 bg-card">
                  <p className="stage-label mb-1">STAGE {stage.number}</p>
                  <p className="stage-title">{stage.name}</p>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section
        ref={uploadRef}
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              GET STARTED
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Upload Your Photo
            </h2>
            <p className="text-muted-foreground">
              Upload a portrait photo and watch it transform into a beautiful
              pencil sketch in seconds.
            </p>
          </div>
          <UploadInterface />
        </div>
      </section>
    </main>
  );
}
