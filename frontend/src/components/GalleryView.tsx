import { useState, useEffect, useCallback } from "react";
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
import {
  generatePencilSketchStages,
  SketchStage,
} from "@/lib/pencilSketchUtils";
import { StageResult, JobStatus } from "@/backend";

interface GalleryViewProps {
  uploadedImageSrc: string;
  jobId: string;
  /** v3 stage results from the backend — used when resultImage is available */
  backendStages?: StageResult[];
}

// Stage display metadata aligned with the new portrait drawing stages
const STAGE_DEFINITIONS_DISPLAY = [
  {
    label: "Stage 1 — Trace the outlines",
    description: "Faint traced contour lines capturing the overall portrait silhouette",
  },
  {
    label: "Stage 2 — Basic elements",
    description: "Clean structural line work establishing basic facial elements",
  },
  {
    label: "Stage 3 — Slight shading",
    description: "Light tonal shading layered over the basic elements for form",
  },
  {
    label: "Stage 4 — Render and detail",
    description: "Detailed rendering with texture, tonal depth, and refined features",
  },
  {
    label: "Stage 5 — Polish",
    description: "Polished final illustration with full tonal range and crisp detail",
  },
];

type StageGenStatus = "pending" | "generating" | "complete" | "error";

export default function GalleryView({
  uploadedImageSrc,
  jobId,
  backendStages,
}: GalleryViewProps) {
  const [clientStages, setClientStages] = useState<(SketchStage | null)[]>(
    Array(5).fill(null)
  );
  const [stageStatuses, setStageStatuses] = useState<StageGenStatus[]>(
    Array(5).fill("pending")
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Check if backend has a completed image for a given stage (0-indexed)
  const getBackendImageUrl = (stageIndex: number): string | null => {
    if (!backendStages || backendStages.length === 0) return null;
    const stageNum = BigInt(stageIndex + 1);
    const match = backendStages.find((s) => s.stageNumber === stageNum);
    if (
      match &&
      match.resultImage &&
      match.status === JobStatus.completed
    ) {
      return match.resultImage.getDirectURL();
    }
    return null;
  };

  // Check if all 5 stages have backend images
  const allBackendImagesAvailable =
    backendStages &&
    backendStages.length >= 5 &&
    backendStages.every(
      (s) => !!s.resultImage && s.status === JobStatus.completed
    );

  const runClientGeneration = useCallback(async () => {
    if (!uploadedImageSrc || isGenerating || allBackendImagesAvailable) return;

    // Check cache first
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

    setIsGenerating(true);
    setGenerationError(null);
    // Mark all stages as generating
    setStageStatuses(Array(5).fill("generating"));

    try {
      await generatePencilSketchStages(
        uploadedImageSrc,
        jobId,
        (stageIndex, stage) => {
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
        }
      );
    } catch {
      setGenerationError(
        "Failed to generate portrait drawing stages. Please try again."
      );
      setStageStatuses((prev) =>
        prev.map((s) => (s === "generating" ? "error" : s))
      );
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedImageSrc, jobId, allBackendImagesAvailable]);

  useEffect(() => {
    if (uploadedImageSrc) {
      runClientGeneration();
    }
  }, [uploadedImageSrc, runClientGeneration]);

  // Get the best available image src for a stage
  const getStageImageSrc = (stageIndex: number): string | null => {
    const backendUrl = getBackendImageUrl(stageIndex);
    if (backendUrl) return backendUrl;
    const clientStage = clientStages[stageIndex];
    return clientStage ? clientStage.dataUrl : null;
  };

  const isStageReady = (stageIndex: number): boolean => {
    return !!getStageImageSrc(stageIndex);
  };

  const isStageLoading = (stageIndex: number): boolean => {
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

  // Lightbox items: original + 5 stages
  const lightboxItems = [
    { label: "Original Portrait", src: uploadedImageSrc },
    ...STAGE_DEFINITIONS_DISPLAY.map((def, idx) => ({
      label: def.label,
      src: getStageImageSrc(idx) ?? "",
    })),
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () =>
    setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  const nextLightbox = () =>
    setLightboxIndex((i) =>
      i !== null ? Math.min(lightboxItems.length - 1, i + 1) : null
    );

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

  const completedCount = Array.from({ length: 5 }, (_, i) =>
    isStageReady(i)
  ).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Generation progress bar */}
      {isGenerating && (
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
          <Loader2 className="w-5 h-5 text-gold animate-spin flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">
              Generating portrait drawing stages…
            </p>
            <div className="w-full bg-border rounded-full h-1.5">
              <div
                className="bg-gold h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground font-mono">
            {completedCount}/5
          </span>
        </div>
      )}

      {generationError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{generationError}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={runClientGeneration}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Original + Stages grid */}
      <div className="space-y-6">
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
              <p className="font-serif text-sm font-semibold text-foreground">
                Original Portrait
              </p>
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

        {/* 5 Stage cards in 2-column grid */}
        <div className="grid grid-cols-2 gap-4">
          {STAGE_DEFINITIONS_DISPLAY.map((def, idx) => {
            const src = getStageImageSrc(idx);
            const loading = isStageLoading(idx);
            const ready = isStageReady(idx);
            const hasError = stageStatuses[idx] === "error";

            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-art"
              >
                {/* Image area */}
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "1 / 1" }}
                >
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
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-2"
                      style={{ background: "#f0ece0" }}
                    >
                      <Loader2 className="w-8 h-8 text-gold animate-spin" />
                      <span className="text-xs text-muted-foreground font-sans">
                        Generating…
                      </span>
                    </div>
                  ) : hasError ? (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-2"
                      style={{ background: "#f0ece0" }}
                    >
                      <AlertCircle className="w-8 h-8 text-destructive" />
                      <span className="text-xs text-destructive font-sans">
                        Failed
                      </span>
                    </div>
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-2"
                      style={{ background: "#f0ece0" }}
                    >
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground font-sans">
                        Pending…
                      </span>
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
                <div className="p-2.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-serif text-xs font-semibold text-foreground leading-tight truncate">
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
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
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

            {/* Label */}
            <p className="mt-4 text-white/80 font-serif text-sm">
              {lightboxItems[lightboxIndex]?.label}
            </p>

            {/* Navigation */}
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

            {/* Download current */}
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
