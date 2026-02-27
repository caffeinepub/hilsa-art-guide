import { Link } from '@tanstack/react-router';
import {
  BookOpen, Upload, Layers, Code2, FileText, Mail, ChevronRight,
  Server, Shield, Database, Zap, Globe, Lock, AlertCircle, RefreshCw
} from 'lucide-react';
import { STAGES } from '@/lib/pencilSketchUtils';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV'];

const STAGE_IMAGES = [
  '/assets/generated/stage1-basic-construction.dim_800x800.png',
  '/assets/generated/stage2-refined-lineart.dim_800x800.png',
  '/assets/generated/stage3-hair-detail.dim_800x800.png',
  '/assets/generated/stage4-final-shaded.dim_800x800.png',
];

interface SectionProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  children: React.ReactNode;
}

function Section({ id, icon, label, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-gold">{icon}</span>
        <span className="section-label">{label}</span>
      </div>
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 leading-tight">
        {title}
      </h2>
      <div className="ink-divider mb-8" />
      {children}
    </section>
  );
}

function CodeBlock({ children, language = 'json' }: { children: string; language?: string }) {
  return (
    <div className="border border-border overflow-hidden">
      <div className="bg-card px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-sans text-muted-foreground tracking-wider uppercase">{language}</span>
      </div>
      <pre className="bg-background p-4 overflow-x-auto">
        <code className="font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

function ApiEndpoint({ method, path, description }: { method: string; path: string; description?: string }) {
  const methodColors: Record<string, string> = {
    GET: 'text-emerald-600 dark:text-emerald-400 border-emerald-600/30 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-950/30',
    POST: 'text-gold border-gold/30 bg-gold/5',
    PUT: 'text-blue-600 dark:text-blue-400 border-blue-600/30 dark:border-blue-400/30 bg-blue-50 dark:bg-blue-950/30',
    DELETE: 'text-red-600 dark:text-red-400 border-red-600/30 dark:border-red-400/30 bg-red-50 dark:bg-red-950/30',
  };
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <span className={`font-mono text-xs font-bold px-2.5 py-1 border ${methodColors[method] ?? 'text-muted-foreground border-border'}`}>
        {method}
      </span>
      <code className="font-mono text-sm text-foreground bg-card border border-border px-3 py-1">{path}</code>
      {description && <span className="font-sans text-xs text-muted-foreground">{description}</span>}
    </div>
  );
}

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-card border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, currentColor 28px, currentColor 29px)' }}
        />
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-16 relative">
          <p className="section-label mb-4">Documentation</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
            HILSA<span className="text-gold">·</span>ART GUIDE
            <br />
            <span className="text-gold">Reference Manual</span>
          </h1>
          <p className="font-sans text-muted-foreground text-lg leading-relaxed max-w-2xl">
            A comprehensive guide to understanding the application's purpose, workflow, technical
            architecture, the four-stage pencil sketch pipeline, and the scalable backend API.
          </p>

          {/* Quick nav */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { href: '#overview', label: 'Overview' },
              { href: '#usage', label: 'How to Use' },
              { href: '#stages', label: 'Sketch Stages' },
              { href: '#architecture', label: 'Architecture' },
              { href: '#pages', label: 'Pages & Features' },
              { href: '#contact', label: 'Support' },
              { href: '#backend-api-reference', label: 'Backend API Reference' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-border hover:border-gold hover:text-gold text-muted-foreground text-xs font-sans tracking-wider uppercase transition-colors duration-200"
              >
                {item.label}
                <ChevronRight size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">

        {/* ── 1. App Overview ── */}
        <Section
          id="overview"
          icon={<BookOpen size={16} />}
          label="01 — Overview"
          title="Application Overview & Purpose"
        >
          <div className="prose-art space-y-5 font-sans text-foreground/80 leading-relaxed">
            <p>
              <strong className="text-foreground font-semibold">HILSA-ART GUIDE</strong> is an
              AI-assisted pencil sketch visualization tool that transforms portrait photographs into
              a four-stage progressive pencil drawing tutorial. The application is designed for
              artists, students, and enthusiasts who want to understand the step-by-step process of
              constructing a realistic pencil portrait.
            </p>
            <p>
              By uploading a reference photograph, users receive a complete breakdown of the drawing
              process — from initial construction lines through to a fully shaded graphite portrait.
              Each stage is rendered using canvas-based image processing that simulates authentic
              pencil strokes, paper grain, and graphite shading on a cream parchment background.
            </p>
            <p>
              The application runs on the{' '}
              <strong className="text-foreground font-semibold">Internet Computer Protocol (ICP)</strong>,
              ensuring decentralized, persistent job storage and reliable image processing without
              reliance on centralized cloud infrastructure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Processing Stages', value: '4' },
                { label: 'Max Jobs / User', value: '10' },
                { label: 'Job Expiry', value: '10 min' },
              ].map((stat) => (
                <div key={stat.label} className="border border-border p-5 text-center">
                  <p className="font-serif text-3xl font-bold text-gold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-sans tracking-wider uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 2. How to Use ── */}
        <Section
          id="usage"
          icon={<Upload size={16} />}
          label="02 — Usage Guide"
          title="How to Use the Application"
        >
          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Upload a Portrait Photo',
                description:
                  'Navigate to the Home page and use the upload interface. Drag and drop a portrait photograph onto the drop zone, or click to browse your files. Supported formats include JPEG and PNG. For best results, use a well-lit, front-facing portrait with a clear subject.',
              },
              {
                step: '02',
                title: 'Submit for Processing',
                description:
                  'Once your image is selected and previewed, click "Generate Sketch Stages." The application creates a processing job on the ICP backend and begins the four-stage sketch pipeline. You will be redirected to the Results page automatically.',
              },
              {
                step: '03',
                title: 'View Your Results',
                description:
                  'The Results page polls the backend for job status and displays each stage as it completes. You can view stages in a 2×2 grid layout or as individual cards. Each stage is labelled with its Roman numeral and descriptive title.',
              },
              {
                step: '04',
                title: 'Download Your Tutorial Grid',
                description:
                  'Once all four stages are complete, a "Download Tutorial Grid" button appears. This composites all four stages into a single 2×2 grid image that you can save and use as a drawing reference.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 group">
                <div className="flex-shrink-0 w-10 h-10 border border-gold/40 flex items-center justify-center">
                  <span className="font-serif text-sm font-bold text-gold">{item.step}</span>
                </div>
                <div className="flex-1 pb-6 border-b border-border last:border-0">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-card border border-gold/20 p-5">
            <p className="text-xs font-sans text-gold tracking-wider uppercase font-semibold mb-2">Tips for Best Results</p>
            <ul className="space-y-1.5 text-sm font-sans text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span> Use high-contrast, well-lit portrait photographs.</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span> Front-facing or three-quarter angle portraits produce the clearest stage breakdowns.</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span> Avoid heavily filtered or low-resolution images for optimal edge detection.</li>
              <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span> Each user may have up to 10 active jobs within a 24-hour window.</li>
            </ul>
          </div>
        </Section>

        {/* ── 3. Sketch Stages ── */}
        <Section
          id="stages"
          icon={<Layers size={16} />}
          label="03 — Sketch Stages"
          title="The Four Pencil Sketch Stages"
        >
          <p className="font-sans text-muted-foreground text-sm leading-relaxed mb-10">
            The sketch pipeline progresses through four distinct stages, each building upon the
            previous to create a complete, realistic pencil portrait. The stages mirror the
            traditional approach used by portrait artists.
          </p>

          <div className="space-y-8">
            {STAGES.map((stage, index) => (
              <div key={stage.number} className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
                {/* Stage image */}
                <div className="w-full md:w-40 aspect-square border border-border overflow-hidden bg-card flex-shrink-0">
                  <img
                    src={STAGE_IMAGES[index]}
                    alt={`Stage ${stage.number} — ${stage.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Stage info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-serif text-xs text-gold tracking-widest uppercase">
                      Stage {ROMAN_NUMERALS[index]}
                    </span>
                    <span className="w-6 h-px bg-gold/40" />
                    <span className="font-sans text-xs text-muted-foreground tracking-wider uppercase">
                      Step {String(stage.number).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {stage.name}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Stage-specific technical notes */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {index === 0 && ['Sobel edge detection', 'Gaussian blur', 'Construction guidelines', 'Freehand jitter'].map(tag => (
                      <span key={tag} className="text-xs font-sans px-2 py-0.5 border border-border text-muted-foreground">{tag}</span>
                    ))}
                    {index === 1 && ['Sharpened edges', 'Darker outlines', 'Facial feature definition', 'Hair shape'].map(tag => (
                      <span key={tag} className="text-xs font-sans px-2 py-0.5 border border-border text-muted-foreground">{tag}</span>
                    ))}
                    {index === 2 && ['Hair strand lines', 'Contour shading', 'Eyebrow detail', 'Cross-hatching'].map(tag => (
                      <span key={tag} className="text-xs font-sans px-2 py-0.5 border border-border text-muted-foreground">{tag}</span>
                    ))}
                    {index === 3 && ['Full graphite shading', 'Smooth blending', 'Hair volume', 'Tonal depth'].map(tag => (
                      <span key={tag} className="text-xs font-sans px-2 py-0.5 border border-border text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tutorial grid preview */}
          <div className="mt-12 border border-border overflow-hidden">
            <div className="bg-card px-5 py-3 border-b border-border">
              <p className="text-xs font-sans text-muted-foreground tracking-wider uppercase">Tutorial Grid — All Four Stages Composited</p>
            </div>
            <div className="p-4">
              <img
                src="/assets/generated/tutorial-4step-grid.dim_1200x1200.png"
                alt="Four-stage tutorial grid"
                className="w-full max-w-lg mx-auto block"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </Section>

        {/* ── 4. Technical Architecture ── */}
        <Section
          id="architecture"
          icon={<Code2 size={16} />}
          label="04 — Architecture"
          title="Technical Architecture"
        >
          <div className="space-y-8 font-sans text-sm text-muted-foreground leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Frontend',
                  items: [
                    'React 19 + TypeScript',
                    'TanStack Router (file-based routing)',
                    'TanStack React Query (server state)',
                    'Tailwind CSS + shadcn/ui components',
                    'Canvas API for sketch processing',
                    'Playfair Display + Inter typography',
                  ],
                },
                {
                  title: 'Backend',
                  items: [
                    'Motoko smart contract on ICP',
                    'Persistent on-chain job storage',
                    'Blob storage for image data',
                    'Principal-based ownership & auth',
                    'Rate limiting (10 jobs / 24 h)',
                    'Auto-expiry for stale jobs (10 min)',
                  ],
                },
              ].map((col) => (
                <div key={col.title} className="border border-border p-5">
                  <p className="font-serif text-base font-semibold text-foreground mb-4">{col.title}</p>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-gold mt-0.5 flex-shrink-0">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border border-border p-5">
              <p className="font-serif text-base font-semibold text-foreground mb-4">Job Processing Pipeline</p>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { step: 'Upload Image', desc: 'User selects a portrait photo' },
                  { step: 'createJob()', desc: 'Backend creates a pending job' },
                  { step: 'processJob()', desc: 'Frontend triggers processing' },
                  { step: 'Stage Generation', desc: 'Canvas pipeline runs 4 stages' },
                  { step: 'Results Display', desc: 'Stages rendered in gallery view' },
                ].map((item, i, arr) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="border border-gold/40 px-3 py-2 mb-1">
                        <p className="text-xs font-sans font-semibold text-foreground whitespace-nowrap">{item.step}</p>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-[100px] leading-tight">{item.desc}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <ChevronRight size={14} className="text-gold/60 flex-shrink-0 mb-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border p-5">
              <p className="font-serif text-base font-semibold text-foreground mb-4">Sketch Processing Algorithm</p>
              <p className="mb-3">
                The canvas-based sketch pipeline uses the following techniques to simulate authentic pencil drawing:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span><span><strong className="text-foreground">Sobel Edge Detection</strong> — Identifies structural edges in the source image to form the basis of sketch lines.</span></li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span><span><strong className="text-foreground">Gaussian Blur</strong> — Softens edges at early stages to simulate light, exploratory pencil strokes.</span></li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span><span><strong className="text-foreground">Freehand Jitter</strong> — Pseudo-random pixel displacement creates the organic wobble of hand-drawn lines.</span></li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span><span><strong className="text-foreground">Graphite Blending</strong> — Progressive darkening of strokes simulates graphite pressure and tonal buildup.</span></li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">·</span><span><strong className="text-foreground">Paper Grain</strong> — Cream parchment background with subtle noise texture replicates drawing paper.</span></li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ── 5. Pages & Features ── */}
        <Section
          id="pages"
          icon={<FileText size={16} />}
          label="05 — Pages & Features"
          title="Pages & Application Features"
        >
          <div className="space-y-5 font-sans text-sm text-muted-foreground leading-relaxed">
            {[
              {
                route: '/',
                name: 'Home',
                description:
                  'The main landing page featuring the upload interface. Users can drag-and-drop or browse for a portrait photograph. The page includes a hero section with stage preview pills, a feature overview, and the upload drop zone.',
              },
              {
                route: '/how-it-works',
                name: 'How It Works',
                description:
                  'A visual walkthrough of the four sketch stages with example images. Each stage is displayed in a 2×2 grid with Roman numeral labels, stage titles, and descriptive text explaining the artistic technique applied.',
              },
              {
                route: '/docs',
                name: 'Documentation',
                description:
                  'This page. A comprehensive reference manual covering the application overview, usage guide, sketch stage details, technical architecture, and backend API reference.',
              },
              {
                route: '/results/$id',
                name: 'Results',
                description:
                  'The job results page, accessed after submitting an image for processing. Displays real-time stage generation progress with a polling mechanism. Supports grid and card view modes, and provides a download button for the composited tutorial grid.',
              },
              {
                route: '/contact',
                name: 'Contact',
                description:
                  'A contact form page with name, email, and message fields. Includes validation, a success confirmation state, and links to social media channels.',
              },
            ].map((page) => (
              <div key={page.route} className="border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <code className="font-mono text-xs bg-card border border-border px-2 py-0.5 text-gold">{page.route}</code>
                  <span className="font-serif text-base font-semibold text-foreground">{page.name}</span>
                </div>
                <p>{page.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 6. Support ── */}
        <Section
          id="contact"
          icon={<Mail size={16} />}
          label="06 — Support"
          title="Contact & Support"
        >
          <div className="space-y-6 font-sans text-sm text-muted-foreground leading-relaxed">
            <p>
              If you encounter issues or have questions about the application, please use the{' '}
              <Link to="/contact" className="text-gold hover:underline underline-offset-2">Contact page</Link>{' '}
              to send a message. Common issues and their resolutions are listed below.
            </p>

            <div className="space-y-4">
              {[
                {
                  issue: 'Upload fails or image is rejected',
                  resolution: 'Ensure the file is a JPEG or PNG under 10 MB. Avoid WebP or HEIC formats.',
                },
                {
                  issue: 'Results page shows "Job not found"',
                  resolution: 'Jobs expire after 10 minutes of inactivity. Return to the Home page and re-upload your image.',
                },
                {
                  issue: 'Stages appear blank or incomplete',
                  resolution: 'The canvas processing requires a clear, well-lit portrait. Try a different image with higher contrast.',
                },
                {
                  issue: 'Rate limit error on job creation',
                  resolution: 'Each user is limited to 10 active jobs within a 24-hour window. Wait for existing jobs to expire or complete.',
                },
              ].map((item) => (
                <div key={item.issue} className="border border-border p-4">
                  <p className="font-semibold text-foreground mb-1">{item.issue}</p>
                  <p>{item.resolution}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════
            BACKEND API REFERENCE
        ══════════════════════════════════════════════════════════════ */}
        <Section
          id="backend-api-reference"
          icon={<Server size={16} />}
          label="07 — Backend API Reference"
          title="Scalable Backend API Documentation"
        >
          {/* Sub-nav for API sections */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              { href: '#api-project-overview', label: 'Project Overview' },
              { href: '#api-auth', label: 'Authentication' },
              { href: '#api-image-upload', label: 'Image Upload' },
              { href: '#api-stage-generation', label: 'Stage Generation' },
              { href: '#api-retrieve-stages', label: 'Retrieve Stages' },
              { href: '#api-feedback', label: 'Feedback' },
              { href: '#api-pdf-export', label: 'PDF Export' },
              { href: '#api-security', label: 'Security' },
              { href: '#api-db-models', label: 'DB Models' },
              { href: '#api-scalability', label: 'Scalability' },
              { href: '#api-future', label: 'Future Expansion' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1 px-3 py-1 border border-border hover:border-gold hover:text-gold text-muted-foreground text-xs font-sans tracking-wider uppercase transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="space-y-16">

            {/* ── API 1. Project Overview ── */}
            <div id="api-project-overview" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">1</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Project Overview</h3>
              </div>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
                <strong className="text-foreground">Hilsa-Art Guide</strong> is an AI-powered image-to-drawing tutorial platform that
                transforms uploaded images into structured 5-stage artistic learning outputs. The system leverages:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { tech: 'DALL·E (OpenAI)', role: 'Structural transformations' },
                  { tech: 'Leonardo AI', role: 'Artistic & stylistic enhancement' },
                  { tech: 'Cloud Storage (S3/Cloudinary)', role: 'Scalable media handling' },
                  { tech: 'MongoDB', role: 'Metadata & user persistence' },
                  { tech: 'JWT Authentication', role: 'Secure access control' },
                  { tech: 'Background Job Queue', role: 'Asynchronous AI processing' },
                ].map((item) => (
                  <div key={item.tech} className="border border-border p-3 flex items-start gap-3">
                    <span className="text-gold mt-0.5 flex-shrink-0">→</span>
                    <div>
                      <p className="font-sans text-xs font-semibold text-foreground">{item.tech}</p>
                      <p className="font-sans text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* High-level flow diagram */}
              <div className="border border-border p-5">
                <p className="text-xs font-sans text-muted-foreground tracking-wider uppercase mb-4">High-Level Architecture Flow</p>
                <div className="overflow-x-auto">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-foreground/70 min-w-max">
                    {[
                      'Client',
                      'Express API',
                      'Auth Middleware',
                      'Controllers',
                      'Services',
                      'AI Processing Queue',
                      'OpenAI / Leonardo AI',
                      'Cloud Storage (CDN)',
                      'MongoDB',
                      'JSON Response',
                    ].map((node, i, arr) => (
                      <div key={node} className="flex items-center gap-2">
                        <span className="border border-gold/30 bg-card px-2 py-1 whitespace-nowrap">{node}</span>
                        {i < arr.length - 1 && <span className="text-gold/60">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Folder structure */}
              <div className="mt-6">
                <p className="font-sans text-xs text-muted-foreground tracking-wider uppercase mb-3">Folder Structure</p>
                <CodeBlock language="bash">{`/hilsa-art-guide-backend
│
├── config/
│   ├── db.js
│   ├── cloudinary.js
│   ├── s3.js
│   ├── openai.js
│   └── leonardo.js
│
├── controllers/
│   ├── authController.js
│   ├── imageController.js
│   ├── stageController.js
│   └── feedbackController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── imageRoutes.js
│   ├── stageRoutes.js
│   └── feedbackRoutes.js
│
├── models/
│   ├── User.js
│   ├── Image.js
│   ├── Stage.js
│   └── Feedback.js
│
├── services/
│   ├── aiService.js
│   ├── imageService.js
│   ├── pdfService.js
│   └── queueService.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── uploadMiddleware.js
│
├── utils/
│   ├── generateToken.js
│   └── responseFormatter.js
│
├── server.js
└── app.js`}</CodeBlock>
              </div>
            </div>

            {/* ── API 2. Authentication ── */}
            <div id="api-auth" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">2</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Authentication (JWT Based)</h3>
              </div>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
                All protected routes require a valid JWT token passed in the <code className="font-mono text-xs bg-card border border-border px-1.5 py-0.5">Authorization: Bearer &lt;token&gt;</code> header.
              </p>

              {/* Register */}
              <div className="space-y-4 mb-8">
                <ApiEndpoint method="POST" path="/api/auth/register" description="Create a new user account" />
                <p className="font-sans text-xs text-muted-foreground mb-2">Request Body</p>
                <CodeBlock>{`{
  "name": "User",
  "email": "user@email.com",
  "password": "securePassword"
}`}</CodeBlock>
                <p className="font-sans text-xs text-muted-foreground mb-2">Response</p>
                <CodeBlock>{`{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "123",
    "email": "user@email.com"
  }
}`}</CodeBlock>
              </div>

              {/* Login */}
              <div className="space-y-4">
                <ApiEndpoint method="POST" path="/api/auth/login" description="Authenticate and receive a JWT token" />
                <p className="font-sans text-xs text-muted-foreground mb-2">Request Body</p>
                <CodeBlock>{`{
  "email": "user@email.com",
  "password": "securePassword"
}`}</CodeBlock>
                <p className="font-sans text-xs text-muted-foreground mb-2">Response</p>
                <CodeBlock>{`{
  "success": true,
  "token": "jwt_token_with_expiration",
  "user": {
    "id": "123",
    "email": "user@email.com",
    "name": "User"
  }
}`}</CodeBlock>
              </div>
            </div>

            {/* ── API 3. Image Upload ── */}
            <div id="api-image-upload" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">3</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Image Upload API</h3>
              </div>

              <ApiEndpoint method="POST" path="/api/images/upload" description="Upload a source image for processing" />

              <div className="border border-border p-4 mb-4">
                <p className="font-sans text-xs font-semibold text-foreground mb-2">Required Headers</p>
                <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="text-gold">Authorization:</span>
                    <span>Bearer &lt;token&gt;</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gold">Content-Type:</span>
                    <span>multipart/form-data</span>
                  </div>
                </div>
              </div>

              <div className="border border-border p-4 mb-4">
                <p className="font-sans text-xs font-semibold text-foreground mb-2">Processing Steps</p>
                <ol className="space-y-1.5 font-sans text-xs text-muted-foreground">
                  {[
                    'Validate file type (JPEG, PNG, WebP)',
                    'Upload to S3 / Cloudinary CDN',
                    'Store metadata in MongoDB',
                    'Return imageId & CDN URL',
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-2">
                      <span className="text-gold font-semibold flex-shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="font-sans text-xs text-muted-foreground mb-2">Response</p>
              <CodeBlock>{`{
  "success": true,
  "imageId": "abc123",
  "imageUrl": "https://cdn.hilsaart.com/images/abc123.jpg"
}`}</CodeBlock>
            </div>

            {/* ── API 4. Stage Generation ── */}
            <div id="api-stage-generation" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">4</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">AI Stage Generation System</h3>
              </div>

              <ApiEndpoint method="POST" path="/api/stages/generate/:imageId" description="Trigger AI stage generation for an uploaded image" />

              <div className="bg-card border border-gold/20 p-4 mb-6 flex items-start gap-3">
                <Zap size={14} className="text-gold flex-shrink-0 mt-0.5" />
                <p className="font-sans text-xs text-muted-foreground">
                  Runs in a <strong className="text-foreground">background queue</strong> (BullMQ / Redis) to prevent API blocking. Supports retry on failure and scales with Redis cluster.
                </p>
              </div>

              {/* 5-stage table */}
              <div className="border border-border overflow-hidden mb-6">
                <div className="bg-card px-4 py-3 border-b border-border">
                  <p className="font-sans text-xs text-muted-foreground tracking-wider uppercase">5 AI-Based Processing Stages</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full font-sans text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card/50">
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-semibold w-16">Stage</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-semibold">Name</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-semibold">AI Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { num: '1️⃣', name: 'Edge Detection', role: 'DALL·E structural contrast extraction', ai: 'DALL·E' },
                        { num: '2️⃣', name: 'Silhouette', role: 'Shape simplification', ai: 'DALL·E' },
                        { num: '3️⃣', name: 'Light & Shadow Mapping', role: 'Tonal mass structuring', ai: 'DALL·E' },
                        { num: '4️⃣', name: 'Detail Structuring', role: 'Feature refinement', ai: 'DALL·E' },
                        { num: '5️⃣', name: 'Final Artistic Render', role: 'Leonardo AI stylistic polish', ai: 'Leonardo AI' },
                      ].map((stage, i) => (
                        <tr key={stage.name} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-card/30'}`}>
                          <td className="px-4 py-3 text-center">
                            <span className="font-serif text-base">{stage.num}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-foreground">{stage.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{stage.role}</span>
                              <span className={`text-xs px-1.5 py-0.5 border font-mono ${stage.ai === 'Leonardo AI' ? 'border-gold/40 text-gold' : 'border-border text-muted-foreground'}`}>
                                {stage.ai}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="font-sans text-xs text-muted-foreground mb-2">Per-Stage Storage Schema</p>
              <CodeBlock>{`{
  "imageId": "abc123",
  "stageNumber": 1,
  "title": "Edge Detection",
  "url": "https://cdn.hilsaart.com/stages/abc123_stage1.jpg",
  "createdAt": "2026-02-27T00:00:00.000Z"
}`}</CodeBlock>
            </div>

            {/* ── API 5. Retrieve Stages ── */}
            <div id="api-retrieve-stages" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">5</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Retrieve Stages</h3>
              </div>

              <ApiEndpoint method="GET" path="/api/stages/:imageId" description="Fetch all generated stages for an image in order" />

              <p className="font-sans text-xs text-muted-foreground mb-2">Response</p>
              <CodeBlock>{`{
  "success": true,
  "stages": [
    {
      "stageNumber": 1,
      "title": "Edge Detection",
      "url": "https://cdn.hilsaart.com/stages/abc123_stage1.jpg"
    },
    {
      "stageNumber": 2,
      "title": "Silhouette",
      "url": "https://cdn.hilsaart.com/stages/abc123_stage2.jpg"
    },
    {
      "stageNumber": 3,
      "title": "Light & Shadow Mapping",
      "url": "https://cdn.hilsaart.com/stages/abc123_stage3.jpg"
    },
    {
      "stageNumber": 4,
      "title": "Detail Structuring",
      "url": "https://cdn.hilsaart.com/stages/abc123_stage4.jpg"
    },
    {
      "stageNumber": 5,
      "title": "Final Artistic Render",
      "url": "https://cdn.hilsaart.com/stages/abc123_stage5.jpg"
    }
  ]
}`}</CodeBlock>
            </div>

            {/* ── API 6. Feedback System ── */}
            <div id="api-feedback" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">6</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Feedback System</h3>
              </div>

              {/* Submit feedback */}
              <div className="space-y-4 mb-8">
                <ApiEndpoint method="POST" path="/api/feedback" description="Submit a rating and message for a processed image" />
                <p className="font-sans text-xs text-muted-foreground mb-2">Request Body</p>
                <CodeBlock>{`{
  "imageId": "abc123",
  "rating": 5,
  "message": "Loved the shading guidance!"
}`}</CodeBlock>
                <p className="font-sans text-xs text-muted-foreground mb-2">Response</p>
                <CodeBlock>{`{
  "success": true,
  "feedbackId": "fb_789",
  "message": "Feedback submitted successfully"
}`}</CodeBlock>
              </div>

              {/* Get feedback */}
              <div className="space-y-4">
                <ApiEndpoint method="GET" path="/api/feedback/:imageId" description="Retrieve aggregated ratings and comments for an image" />
                <p className="font-sans text-xs text-muted-foreground mb-2">Response</p>
                <CodeBlock>{`{
  "success": true,
  "averageRating": 4.7,
  "totalReviews": 23,
  "feedback": [
    {
      "rating": 5,
      "message": "Loved the shading guidance!",
      "createdAt": "2026-02-27T00:00:00.000Z"
    }
  ]
}`}</CodeBlock>
              </div>
            </div>

            {/* ── API 7. PDF Export ── */}
            <div id="api-pdf-export" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">7</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">PDF Export System</h3>
              </div>

              <ApiEndpoint method="GET" path="/api/images/export/:imageId" description="Generate and download a PDF tutorial for all 5 stages" />

              <div className="border border-border p-4 mb-4">
                <p className="font-sans text-xs font-semibold text-foreground mb-2">Processing Steps</p>
                <ol className="space-y-1.5 font-sans text-xs text-muted-foreground">
                  {[
                    'Fetch all 5 completed stages from MongoDB',
                    'Compile stages in order (1 → 5)',
                    'Generate PDF via pdfService (PDFKit / Puppeteer)',
                    'Store generated PDF in cloud storage (S3/Cloudinary)',
                    'Return signed download link',
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-2">
                      <span className="text-gold font-semibold flex-shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="font-sans text-xs text-muted-foreground mb-2">Response</p>
              <CodeBlock>{`{
  "success": true,
  "pdfUrl": "https://cdn.hilsaart.com/tutorials/abc123.pdf"
}`}</CodeBlock>
            </div>

            {/* ── API 8. Security & Performance ── */}
            <div id="api-security" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">8</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Security & Performance Layer</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Lock size={14} />,
                    title: 'JWT Middleware',
                    items: [
                      'Protect all private routes',
                      'Token verification on every request',
                      'Role-based access control (future)',
                    ],
                  },
                  {
                    icon: <Shield size={14} />,
                    title: 'Rate Limiting',
                    items: [
                      '100 requests / 15 min per IP',
                      'Stricter throttling on AI routes',
                      'Redis-backed counter storage',
                    ],
                  },
                  {
                    icon: <AlertCircle size={14} />,
                    title: 'Error Handling',
                    items: [
                      'Standardized JSON error format',
                      'HTTP status codes enforced',
                      'Centralized error middleware',
                    ],
                  },
                  {
                    icon: <RefreshCw size={14} />,
                    title: 'Background Queue',
                    items: [
                      'Prevents API blocking on AI calls',
                      'Automatic retry on failed jobs',
                      'Scalable with Redis cluster',
                    ],
                  },
                  {
                    icon: <Globe size={14} />,
                    title: 'CDN Integration',
                    items: [
                      'Fast global image delivery',
                      'Reduced origin server load',
                      'Signed URLs for secure access',
                    ],
                  },
                ].map((card) => (
                  <div key={card.title} className="border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gold">{card.icon}</span>
                      <p className="font-serif text-sm font-semibold text-foreground">{card.title}</p>
                    </div>
                    <ul className="space-y-1.5 font-sans text-xs text-muted-foreground">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-gold mt-0.5 flex-shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Standardized error format */}
              <div className="mt-6">
                <p className="font-sans text-xs text-muted-foreground mb-2">Standardized Error Response Format</p>
                <CodeBlock>{`{
  "success": false,
  "error": "Invalid image format",
  "code": "INVALID_FILE_TYPE",
  "statusCode": 400
}`}</CodeBlock>
              </div>
            </div>

            {/* ── API 9. Database Models ── */}
            <div id="api-db-models" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">9</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Database Models Overview</h3>
              </div>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
                All data is persisted in <strong className="text-foreground">MongoDB Atlas</strong> using Mongoose schemas. Each model is designed for horizontal scalability and indexed for query performance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    model: 'User',
                    fields: [
                      { name: 'name', type: 'String', note: 'required' },
                      { name: 'email', type: 'String', note: 'unique, required' },
                      { name: 'password', type: 'String', note: 'hashed (bcrypt)' },
                      { name: 'createdAt', type: 'Date', note: 'auto' },
                    ],
                  },
                  {
                    model: 'Image',
                    fields: [
                      { name: 'userId', type: 'ObjectId', note: 'ref: User' },
                      { name: 'originalUrl', type: 'String', note: 'CDN URL' },
                      { name: 'createdAt', type: 'Date', note: 'auto' },
                    ],
                  },
                  {
                    model: 'Stage',
                    fields: [
                      { name: 'imageId', type: 'ObjectId', note: 'ref: Image' },
                      { name: 'stageNumber', type: 'Number', note: '1–5' },
                      { name: 'title', type: 'String', note: 'stage name' },
                      { name: 'url', type: 'String', note: 'CDN URL' },
                      { name: 'createdAt', type: 'Date', note: 'auto' },
                      { name: 'updatedAt', type: 'Date', note: 'auto' },
                    ],
                  },
                  {
                    model: 'Feedback',
                    fields: [
                      { name: 'imageId', type: 'ObjectId', note: 'ref: Image' },
                      { name: 'rating', type: 'Number', note: '1–5' },
                      { name: 'message', type: 'String', note: 'optional' },
                      { name: 'createdAt', type: 'Date', note: 'auto' },
                    ],
                  },
                ].map((model) => (
                  <div key={model.model} className="border border-border overflow-hidden">
                    <div className="bg-card px-4 py-2.5 border-b border-border flex items-center gap-2">
                      <Database size={12} className="text-gold" />
                      <p className="font-mono text-sm font-semibold text-foreground">{model.model}</p>
                    </div>
                    <table className="w-full font-sans text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-2 text-muted-foreground font-semibold">Field</th>
                          <th className="text-left px-4 py-2 text-muted-foreground font-semibold">Type</th>
                          <th className="text-left px-4 py-2 text-muted-foreground font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {model.fields.map((field, i) => (
                          <tr key={field.name} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-card/30'}`}>
                            <td className="px-4 py-2 font-mono text-gold">{field.name}</td>
                            <td className="px-4 py-2 text-foreground/70">{field.type}</td>
                            <td className="px-4 py-2 text-muted-foreground">{field.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

            {/* ── API 10. Scalability Strategy ── */}
            <div id="api-scalability" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">10</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Scalability Strategy</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Horizontal Scaling', desc: 'Load balancer distributes traffic across stateless API server instances.' },
                  { title: 'Stateless API Servers', desc: 'No session state stored on servers; all state in Redis or MongoDB.' },
                  { title: 'Redis-Backed Queue', desc: 'BullMQ job queue scales independently with Redis cluster replication.' },
                  { title: 'MongoDB Atlas Clustering', desc: 'Replica sets and sharding for high availability and read scalability.' },
                  { title: 'CDN for Static Assets', desc: 'All images and PDFs served from edge nodes for global low-latency delivery.' },
                  { title: 'Microservice-Ready', desc: 'Service layer is modular and can be extracted into independent microservices.' },
                ].map((item) => (
                  <div key={item.title} className="border border-border p-4">
                    <p className="font-serif text-sm font-semibold text-foreground mb-1">{item.title}</p>
                    <p className="font-sans text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── API 11. Future Expansion ── */}
            <div id="api-future" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gold border border-gold/30 px-2 py-0.5">11</span>
                <h3 className="font-serif text-xl font-semibold text-foreground">Future Expansion</h3>
              </div>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
                The architecture is designed to accommodate the following planned features without requiring major refactoring:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'AI Prompt Customization',
                  'Premium Subscription Model',
                  'Version History Tracking',
                  'User Tutorial Portfolio',
                  'AI Chat Drawing Mentor',
                  'Multi-style Exports (ink, watercolor, charcoal)',
                ].map((feature) => (
                  <div key={feature} className="border border-border border-dashed p-3 flex items-start gap-2">
                    <span className="text-gold mt-0.5 flex-shrink-0">◇</span>
                    <p className="font-sans text-xs text-muted-foreground">{feature}</p>
                  </div>
                ))}
              </div>

              {/* Conclusion */}
              <div className="mt-8 bg-card border border-gold/30 p-6">
                <p className="font-serif text-base font-semibold text-foreground mb-4">
                  🎯 Architecture Summary
                </p>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4">
                  The Hilsa-Art Guide Backend Architecture is designed to be production-ready from day one:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Modular', icon: '✔' },
                    { label: 'Secure', icon: '✔' },
                    { label: 'Scalable', icon: '✔' },
                    { label: 'AI-Integrated', icon: '✔' },
                    { label: 'Production-Ready', icon: '✔' },
                    { label: 'Maintainable', icon: '✔' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-gold font-bold">{item.icon}</span>
                      <span className="font-sans text-sm text-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Section>

      </div>
    </div>
  );
}
