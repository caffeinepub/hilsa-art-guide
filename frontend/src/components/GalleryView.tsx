import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generatePencilSketchStages,
  SketchStage,
} from "@/lib/pencilSketchUtils";
import { StageResult, JobStatus } from "@/backend";

interface GalleryViewProps {
  uploadedImageSrc: string;
  jobId: string;
  backendStages?: StageResult[];
}

const STAGE_DEFINITIONS_DISPLAY = [
  {
    label: "Stage 1 — Light Outline",
    description: "Barely-visible ghost contours on clean cream paper",
  },
  {
    label: "Stage 2 — Basic Structure",
    description: "Light sketch with sparse directional hatching",
  },
  {
    label: "Stage 3 — Defined Features",
    description: "Medium cross-hatching with stronger facial detail",
  },
  {
    label: "Stage 4 — Hair & Shading",
    description: "Dense hatching with hair strokes and tonal shading",
  },
  {
    label: "Stage 5 — Final Artwork",
    description: "Fully detailed portrait with graphite grain and vignette",
  },
];

type StageGenStatus = "pending" | "generating" | "complete" | "error";

export default function GalleryView({
  uploadedImageSrc,
  jobId,
  backendStages,
}: GalleryViewProps) {
  const [clientStages, setClientStages] = useState<(SketchStage | null)[]>(Array(5).fill(null));
  const [stageStatuses, setStageStatuses] = useState<StageGenStatus[]>(Array(5).fill("pending"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const generatingRef = useRef(false);

  const getBackendImageUrl = (stageIndex: number): string | null => {
    if (!backendStages || backendStages.length === 0) return null;
    const stageNum = BigInt(stageIndex + 1);
    const match = backendStages.find((s) => s.stageNumber === stageNum);
    if (match && match.resultImage && match.status === JobStatus.completed) {
      return match.resultImage.getDirectURL();
    }
    return null;
  };

  const allBackendImagesAvailable =
    backendStages &&
    backendStages.length >= 5 &&
    backendStages.every((s) => !!s.resultImage && s.status === JobStatus.completed);

  const runClientGeneration = useCallback(async () => {
    if (!uploadedImageSrc || generatingRef.current || allBackendImagesAvailable) return;

    // Check session cache
    const cacheKey = `sketch_stages_v4_${jobId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as SketchStage[];
        if (Array.isArray(parsed) && parsed.length === 5) {
          setClientStages(parsed);
          setStageStatuses(Array(5).fill("complete"));
          return;
        }
      } catch {
        // ignore
      }
    }

    generatingRef.current = true;
    setIsGenerating(true);
    setGenerationError(null);
    // Mark all as generating
    setStageStatuses(Array(5).fill("generating"));

    const allStages: SketchStage[] = [];

    try {
      await generatePencilSketchStages(uploadedImageSrc, (stageIndex, stage) => {
        // Progressive update: set each stage as it completes
        allStages.push(stage);
        setClientStages((prev) => {
          const next = [...prev];
          next[stageIndex] = stage;
          return next;
        });
        setStageStatuses((prev) => {
          const next = [...prev];
          next[stageIndex] = "complete";
          return next;
        });
      });

      // Cache the completed results
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(allStages));
      } catch {
        // ignore quota errors
      }
    } catch {
      setGenerationError("Failed to generate sketch stages. Please try again.");
      setStageStatuses((prev) => prev.map((s) => (s === "generating" ? "error" : s)));
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  }, [uploadedImageSrc, jobId, allBackendImagesAvailable]);

  useEffect(() => {
    if (uploadedImageSrc) {
      runClientGeneration();
    }
  }, [uploadedImageSrc, runClientGeneration]);

  const getStageImageSrc = (stageIndex: number): string | null => {
    const backendUrl = getBackendImageUrl(stageIndex);
    if (backendUrl) return backendUrl;
    return clientStages[stageIndex]?.dataUrl ?? null;
  };

  const isStageReady = (stageIndex: number) => !!getStageImageSrc(stageIndex);
  const isStageLoading = (stageIndex: number) => {
    if (isStageReady(stageIndex)) return false;
    return stageStatuses[stageIndex] === "generating" || isGenerating;
  };

  const handleDownload = (src: string, label: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `${label.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const completedCount = Array.from({ length: 5 }, (_, i) => isStageReady(i)).filter(Boolean).length;

  const lightboxItems = [
    { label: "Original Portrait", src: uploadedImageSrc },
    ...STAGE_DEFINITIONS_DISPLAY.map((def, idx) => ({
      label: def.label,
      src: getStageImageSrc(idx) ?? "",
    })),
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () => setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  const nextLightbox = () =>
    setLightboxIndex((i) => (i !== null ? Math.min(lightboxItems.length - 1, i + 1) : null));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex]);

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      {isGenerating && (
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
          <Loader2 className="w-5 h-5 text-gold animate-spin flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1.5">
              Rendering pencil sketch stages…
            </p>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gold h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground font-mono tabular-nums">
            {completedCount}/5
          </span>
        </div>
      )}

      {generationError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{generationError}</p>
          <Button size="sm" variant="outline" onClick={runClientGeneration} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {/* Original photo */}
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-art">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={uploadedImageSrc}
            alt="Original Portrait"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <button
              onClick={() => openLightbox(0)}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg"
              aria-label="View full size"
            >
              <ZoomIn className="w-5 h-5 text-ink" />
            </button>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div>
            <p className="font-serif text-sm font-semibold text-foreground">Original Portrait</p>
            <p className="text-xs text-muted-foreground">Your uploaded photo</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload(uploadedImageSrc, "original_portrait")}
            className="h-8 px-2"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 5 Stage cards — responsive grid: 1 col mobile → 2 col tablet → 5 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGE_DEFINITIONS_DISPLAY.map((def, idx) => {
          const src = getStageImageSrc(idx);
          const loading = isStageLoading(idx);
          const ready = isStageReady(idx);
          const hasError = stageStatuses[idx] === "error";

          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-art flex flex-col"
            >
              {/* Image area */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                {ready && src ? (
                  <>
                    <img
                      src={src}
                      alt={def.label}
                      className="w-full h-full object-cover"
                      style={{ background: "#f0ece0" }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <button
                        onClick={() => openLightbox(idx + 1)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg"
                        aria-label={`View ${def.label} full size`}
                      >
                        <ZoomIn className="w-4 h-4 text-ink" />
                      </button>
                    </div>
                  </>
                ) : loading ? (
                  <div className="w-full h-full relative" style={{ background: "#f0ece0" }}>
                    <Skeleton className="absolute inset-0 rounded-none" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-7 h-7 text-gold animate-spin" />
                      <span className="text-xs text-muted-foreground font-sans">Rendering…</span>
                    </div>
                  </div>
                ) : hasError ? (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                    style={{ background: "#f0ece0" }}
                  >
                    <AlertCircle className="w-7 h-7 text-destructive" />
                    <span className="text-xs text-destructive font-sans">Failed</span>
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                    style={{ background: "#f0ece0" }}
                  >
                    <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground font-sans">Pending…</span>
                  </div>
                )}

                {/* Stage number badge */}
                <div className="absolute top-2 left-2 bg-ink/80 text-white text-xs font-mono px-1.5 py-0.5 rounded">
                  {idx + 1}
                </div>

                {/* Completed checkmark */}
                {ready && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-gold drop-shadow" />
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="p-2.5 flex items-start justify-between gap-2 flex-1">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xs font-semibold text-foreground leading-tight">
                    {def.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                    {def.description}
                  </p>
                </div>
                {ready && src && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(src, def.label)}
                    className="h-7 w-7 p-0 flex-shrink-0"
                    title={`Download ${def.label}`}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxItems[lightboxIndex]?.src ? (
              <img
                src={lightboxItems[lightboxIndex].src}
                alt={lightboxItems[lightboxIndex].label}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
                style={{ background: "#f0ece0" }}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-card rounded-lg">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
              </div>
            )}

            <p className="mt-4 text-white/80 font-serif text-sm">
              {lightboxItems[lightboxIndex]?.label}
            </p>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={prevLightbox}
                disabled={lightboxIndex === 0}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <span className="text-white/50 text-sm font-mono">
                {lightboxIndex + 1} / {lightboxItems.length}
              </span>
              <button
                onClick={nextLightbox}
                disabled={lightboxIndex === lightboxItems.length - 1}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {lightboxItems[lightboxIndex]?.src && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleDownload(
                    lightboxItems[lightboxIndex].src,
                    lightboxItems[lightboxIndex].label
                  )
                }
                className="mt-3 text-white border-white/30 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
