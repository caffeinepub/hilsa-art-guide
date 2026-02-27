import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Loader2,
  AlertCircle,
  ImageIcon,
  RefreshCw,
  Pencil,
  Grid2X2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generatePencilSketchStages,
  generateTutorialGrid,
  SketchStage,
  STAGES,
} from "@/lib/pencilSketchUtils";
import { StageResult, JobStatus } from "@/backend";

interface GalleryViewProps {
  uploadedImageSrc: string;
  jobId: string;
  /** v3 stage results from the backend — used when resultImage is available */
  backendStages?: StageResult[];
}

type StageGenStatus = "pending" | "generating" | "complete" | "error";

const STAGE_POSITIONS = [
  { label: "Top Left", gridArea: "1 / 1 / 2 / 2" },
  { label: "Top Right", gridArea: "1 / 2 / 2 / 3" },
  { label: "Bottom Left", gridArea: "2 / 1 / 3 / 2" },
  { label: "Bottom Right", gridArea: "2 / 2 / 3 / 3" },
];

export default function GalleryView({
  uploadedImageSrc,
  jobId,
  backendStages,
}: GalleryViewProps) {
  const [clientStages, setClientStages] = useState<(SketchStage | null)[]>(
    Array(4).fill(null)
  );
  const [stageStatuses, setStageStatuses] = useState<StageGenStatus[]>(
    Array(4).fill("pending")
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "cards">("grid");
  const [tutorialGridUrl, setTutorialGridUrl] = useState<string | null>(null);
  const [isGeneratingGrid, setIsGeneratingGrid] = useState(false);

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

  // Check if all 4 stages have backend images
  const allBackendImagesAvailable =
    backendStages &&
    backendStages.length >= 4 &&
    backendStages.every(
      (s) => !!s.resultImage && s.status === JobStatus.completed
    );

  const runClientGeneration = useCallback(async () => {
    if (!uploadedImageSrc || isGenerating || allBackendImagesAvailable) return;

    // Check cache first — v7 key matches pencilSketchUtils
    const cacheKey = `sketch_stages_v7_${jobId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as SketchStage[];
        if (Array.isArray(parsed) && parsed.length === 4) {
          setClientStages(parsed);
          setStageStatuses(Array(4).fill("complete"));
          return;
        }
      } catch {
        // ignore
      }
    }

    setIsGenerating(true);
    setGenerationError(null);
    setStageStatuses(Array(4).fill("generating"));

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

  // Generate the 2x2 tutorial grid once all 4 stages are complete
  useEffect(() => {
    const allComplete = clientStages.every((s) => s !== null);
    if (allComplete && !tutorialGridUrl && !isGeneratingGrid) {
      const stages = clientStages as SketchStage[];
      setIsGeneratingGrid(true);
      generateTutorialGrid(stages, 600)
        .then((url) => setTutorialGridUrl(url))
        .catch(() => {/* ignore */})
        .finally(() => setIsGeneratingGrid(false));
    }
  }, [clientStages, tutorialGridUrl, isGeneratingGrid]);

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

  const completedCount = Array.from({ length: 4 }, (_, i) =>
    isStageReady(i)
  ).filter(Boolean).length;

  const allStagesReady = completedCount === 4;

  return (
    <div className="space-y-6">
      {/* Generation progress bar */}
      {isGenerating && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-dashed border-stone-400 rounded-xl">
          <Loader2 className="w-5 h-5 text-stone-600 animate-spin flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-stone-700 mb-1 font-sans">
              Drawing your portrait stages…
            </p>
            <div className="w-full bg-stone-200 rounded-full h-1.5">
              <div
                className="bg-stone-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-stone-500 font-mono">
            {completedCount}/4
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

      {/* View mode toggle — only show when all stages are ready */}
      {allStagesReady && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500 font-sans">
            {viewMode === "grid"
              ? "4-step tutorial layout"
              : "Individual stage cards"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-stone-700 text-amber-50"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              2×2 Grid
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-stone-700 text-amber-50"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Cards
            </button>
          </div>
        </div>
      )}

      {/* ── 2×2 Tutorial Grid View ── */}
      {viewMode === "grid" && allStagesReady && (
        <div className="space-y-4">
          {/* Grid container */}
          <div
            className="rounded-2xl overflow-hidden border-2 border-dashed border-stone-300 shadow-md"
            style={{ background: "#f2eee4" }}
          >
            <div
              className="grid grid-cols-2"
              style={{ gap: "2px", background: "rgba(180,170,155,0.4)" }}
            >
              {STAGES.map((stageDef, idx) => {
                const src = getStageImageSrc(idx);
                const pos = STAGE_POSITIONS[idx];
                return (
                  <div
                    key={idx}
                    className="relative group"
                    style={{ background: "#f2eee4" }}
                  >
                    {src ? (
                      <>
                        <img
                          src={src}
                          alt={`Stage ${idx + 1}: ${stageDef.name}`}
                          className="w-full object-cover block"
                          style={{ aspectRatio: "1 / 1" }}
                        />
                        {/* Hover download overlay */}
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-200 flex items-end justify-end p-2">
                          <button
                            onClick={() =>
                              handleDownload(src, `Stage ${idx + 1} - ${stageDef.name}`)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-50/95 hover:bg-white border border-stone-300 rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-medium text-stone-700 shadow-sm"
                            aria-label={`Download Stage ${idx + 1}`}
                          >
                            <Download className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        className="w-full flex items-center justify-center bg-stone-50"
                        style={{ aspectRatio: "1 / 1" }}
                      >
                        <ImageIcon className="w-8 h-8 text-stone-300" />
                      </div>
                    )}
                    {/* Stage label badge — bottom of each quadrant */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-xs font-sans font-medium truncate">
                        {pos.label} · {stageDef.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage captions below the grid */}
          <div className="grid grid-cols-2 gap-3">
            {STAGES.map((stageDef, idx) => (
              <div
                key={idx}
                className="bg-amber-50/60 border border-dashed border-stone-300 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-700 text-amber-50 text-[10px] font-mono font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="font-serif text-sm font-bold text-stone-800 leading-snug">
                    {stageDef.name}
                  </h3>
                </div>
                <p className="font-sans text-xs text-stone-500 leading-relaxed pl-7">
                  {stageDef.description}
                </p>
              </div>
            ))}
          </div>

          {/* Download full tutorial grid */}
          {tutorialGridUrl && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(tutorialGridUrl, "pencil-tutorial-4step-grid")}
                className="gap-2 border-stone-400 text-stone-700 hover:bg-stone-100"
              >
                <Download className="w-4 h-4" />
                Download Tutorial Grid
              </Button>
            </div>
          )}
          {isGeneratingGrid && (
            <div className="flex justify-center pt-2">
              <span className="flex items-center gap-2 text-xs text-stone-400 font-sans">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Compositing tutorial grid…
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Individual Stage Cards View ── */}
      {(viewMode === "cards" || !allStagesReady) && (
        <div className="space-y-6">
          {STAGES.map((stageDef, idx) => {
            const src = getStageImageSrc(idx);
            const loading = isStageLoading(idx);
            const ready = isStageReady(idx);
            const hasError = stageStatuses[idx] === "error";

            return (
              <div
                key={idx}
                className="bg-amber-50/60 border-2 border-dashed border-stone-300 rounded-2xl overflow-hidden shadow-sm"
                style={{ boxShadow: "2px 3px 12px 0 rgba(80,60,30,0.07)" }}
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-3 border-b border-dashed border-stone-200">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-stone-700 text-amber-50 text-xs font-mono font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <h2 className="font-serif text-xl font-bold text-stone-800 leading-snug">
                      {stageDef.name}
                    </h2>
                    <Pencil className="w-4 h-4 text-stone-400 ml-auto flex-shrink-0" />
                  </div>
                  <p className="font-sans text-sm text-stone-600 leading-relaxed pl-10">
                    {stageDef.description}
                  </p>
                </div>

                {/* Stage image */}
                <div className="p-4">
                  <div
                    className="rounded-xl overflow-hidden border border-stone-200"
                    style={{ background: "#f5f0e8" }}
                  >
                    {ready && src ? (
                      <div className="relative group">
                        <img
                          src={src}
                          alt={`Step ${idx + 1}: ${stageDef.name}`}
                          className="w-full object-cover"
                          style={{ display: "block" }}
                        />
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-200 flex items-end justify-end p-3">
                          <button
                            onClick={() =>
                              handleDownload(
                                src,
                                `Step ${idx + 1} - ${stageDef.name}`
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-50/95 hover:bg-white border border-stone-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-700 shadow-sm"
                            aria-label={`Download Step ${idx + 1}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
                      </div>
                    ) : loading ? (
                      <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 bg-stone-50">
                        <Loader2 className="w-10 h-10 text-stone-400 animate-spin" />
                        <span className="text-sm text-stone-500 font-sans">
                          Drawing stage {idx + 1}…
                        </span>
                      </div>
                    ) : hasError ? (
                      <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 bg-stone-50">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                        <span className="text-sm text-destructive font-sans">
                          Failed to generate
                        </span>
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 bg-stone-50">
                        <ImageIcon className="w-10 h-10 text-stone-300" />
                        <span className="text-sm text-stone-400 font-sans">
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
      )}
    </div>
  );
}
