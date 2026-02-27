import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Loader2,
  AlertCircle,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generatePencilSketchStages,
  SketchStage,
  STAGE_LABELS,
  STAGE_DESCRIPTIONS,
} from "@/lib/pencilSketchUtils";
import { StageResult, JobStatus } from "@/backend";

interface GalleryViewProps {
  uploadedImageSrc: string;
  jobId: string;
  /** v3 stage results from the backend — used when resultImage is available */
  backendStages?: StageResult[];
}

// Stage display metadata using the exact user-provided copy as single source of truth
const STAGE_DEFINITIONS_DISPLAY = STAGE_LABELS.map((label, i) => ({
  label,
  description: STAGE_DESCRIPTIONS[i],
}));

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
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Check if backend has a completed image for a given stage (0-indexed)
  const getBackendImageUrl = (stageIndex: number): string | null => {
    if (!backendStages || backendStages.length === 0) return null;
    const stageNum = BigInt(stageIndex + 1);
    const match = backendStages.find((s) => s.stageNumber === stageNum);
    if (match && match.resultImage && match.status === JobStatus.completed) {
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

    // Check cache first — v5 key matches pencilSketchUtils
    const cacheKey = `sketch_stages_v5_${jobId}`;
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

  const completedCount = Array.from({ length: 5 }, (_, i) =>
    isStageReady(i)
  ).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Generation progress bar */}
      {isGenerating && (
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
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
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive flex-1">{generationError}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={runClientGeneration}
            className="ml-auto gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Five stage cards — vertical stack matching reference screenshot */}
      <div className="space-y-5">
        {STAGE_DEFINITIONS_DISPLAY.map((def, idx) => {
          const src = getStageImageSrc(idx);
          const loading = isStageLoading(idx);
          const ready = isStageReady(idx);
          const hasError = stageStatuses[idx] === "error";

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md overflow-hidden"
            >
              {/* Card text content */}
              <div className="px-5 pt-5 pb-4">
                <h2 className="font-sans text-xl font-bold text-gray-900 mb-2 leading-snug">
                  Step {idx + 1}: {def.label}
                </h2>
                <p className="font-sans text-base text-gray-600 leading-relaxed">
                  {def.description}
                </p>
              </div>

              {/* Stage image — full width inside card */}
              <div className="px-4 pb-4">
                <div className="rounded-xl overflow-hidden bg-[#f0ece0]">
                  {ready && src ? (
                    <div className="relative group">
                      <img
                        src={src}
                        alt={`Step ${idx + 1}: ${def.label}`}
                        className="w-full object-cover"
                        style={{ display: "block" }}
                      />
                      {/* Download overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-end justify-end p-3">
                        <button
                          onClick={() => handleDownload(src, `Step ${idx + 1} - ${def.label}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 shadow-sm"
                          aria-label={`Download Step ${idx + 1}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 bg-[#f0ece0]">
                      <Loader2 className="w-10 h-10 text-gold animate-spin" />
                      <span className="text-sm text-muted-foreground font-sans">
                        Generating stage {idx + 1}…
                      </span>
                    </div>
                  ) : hasError ? (
                    <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 bg-[#f0ece0]">
                      <AlertCircle className="w-10 h-10 text-destructive" />
                      <span className="text-sm text-destructive font-sans">
                        Failed to generate
                      </span>
                    </div>
                  ) : (
                    <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 bg-[#f0ece0]">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      <span className="text-sm text-muted-foreground font-sans">
                        Waiting…
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
