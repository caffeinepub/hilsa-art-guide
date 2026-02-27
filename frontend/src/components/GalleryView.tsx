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
  backendStages?: StageResult[];
}

type StageGenStatus = "pending" | "generating" | "complete" | "error";

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
    backendStages.length >= 4 &&
    backendStages.every(
      (s) => !!s.resultImage && s.status === JobStatus.completed
    );

  const runClientGeneration = useCallback(async () => {
    if (!uploadedImageSrc || isGenerating || allBackendImagesAvailable) return;

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

  const ROMAN = ['I', 'II', 'III', 'IV'];

  return (
    <div className="space-y-5">
      {/* Generation progress */}
      {isGenerating && (
        <div className="flex items-center gap-3 p-4 bg-paper-warm border border-paper-rule rounded-none">
          <Loader2 className="w-4 h-4 text-graphite animate-spin flex-shrink-0" />
          <div className="flex-1">
            <p className="font-cormorant text-sm text-graphite mb-1">
              Drawing your portrait stages…
            </p>
            <div className="w-full bg-paper-rule rounded-full h-0.5">
              <div
                className="bg-graphite h-0.5 transition-all duration-500"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
          </div>
          <span className="font-serif text-xs text-graphite-light">
            {completedCount}/4
          </span>
        </div>
      )}

      {generationError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="font-cormorant text-sm text-destructive flex-1">{generationError}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={runClientGeneration}
            className="ml-auto gap-1.5 rounded-none border-graphite text-graphite"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </Button>
        </div>
      )}

      {/* View mode toggle */}
      {allStagesReady && (
        <div className="flex items-center justify-between">
          <p className="font-cormorant text-sm text-graphite-light">
            {viewMode === "grid" ? "4-step tutorial layout" : "Individual stage cards"}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all border ${
                viewMode === "grid"
                  ? "bg-graphite text-paper border-graphite"
                  : "bg-paper text-graphite-light border-paper-rule hover:border-graphite"
              }`}
            >
              <Grid2X2 className="w-3 h-3" />
              2×2 Grid
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all border ${
                viewMode === "cards"
                  ? "bg-graphite text-paper border-graphite"
                  : "bg-paper text-graphite-light border-paper-rule hover:border-graphite"
              }`}
            >
              <Pencil className="w-3 h-3" />
              Cards
            </button>
          </div>
        </div>
      )}

      {/* ── 2×2 Tutorial Grid View ── */}
      {viewMode === "grid" && allStagesReady && (
        <div className="space-y-0">
          {/* Grid */}
          <div
            className="w-full overflow-hidden"
            style={{ border: '1px solid #c8c0b0' }}
          >
            <div
              className="grid grid-cols-2"
              style={{ gap: '1px', background: '#c8c0b0' }}
            >
              {STAGES.map((stageDef, idx) => {
                const src = getStageImageSrc(idx);
                return (
                  <div
                    key={idx}
                    className="relative group bg-paper-warm"
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    {src ? (
                      <>
                        <img
                          src={src}
                          alt={`Stage ${idx + 1}: ${stageDef.name}`}
                          className="w-full h-full object-cover block"
                          style={{ aspectRatio: '1 / 1' }}
                        />
                        {/* Roman numeral overlay */}
                        <div className="absolute top-2 left-3 pointer-events-none">
                          <span
                            className="font-serif text-xl font-normal leading-none select-none"
                            style={{ color: 'rgba(60, 52, 42, 0.50)' }}
                          >
                            {ROMAN[idx]}
                          </span>
                        </div>
                        {/* Hover download */}
                        <div className="absolute inset-0 bg-graphite/0 group-hover:bg-graphite/8 transition-colors duration-200 flex items-end justify-end p-2">
                          <button
                            onClick={() =>
                              handleDownload(src, `Stage ${idx + 1} - ${stageDef.name}`)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-paper/95 hover:bg-paper border border-paper-rule px-2 py-1 flex items-center gap-1 text-xs font-medium text-graphite"
                            aria-label={`Download Stage ${idx + 1}`}
                          >
                            <Download className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center bg-paper-warm"
                        style={{ aspectRatio: '1 / 1' }}
                      >
                        <ImageIcon className="w-6 h-6 text-paper-rule" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage captions */}
          <div
            className="grid grid-cols-2"
            style={{ borderLeft: '1px solid #c8c0b0', borderRight: '1px solid #c8c0b0', borderBottom: '1px solid #c8c0b0', gap: '0' }}
          >
            {STAGES.map((stageDef, idx) => (
              <div
                key={idx}
                className={`px-4 py-3 ${idx % 2 === 0 ? 'border-r' : ''} ${idx < 2 ? 'border-b' : ''}`}
                style={{ borderColor: '#c8c0b0' }}
              >
                <p className="sketch-stage-label mb-0.5">Stage {ROMAN[idx]}</p>
                <h3 className="font-serif text-sm font-normal text-graphite leading-snug">
                  {stageDef.name}
                </h3>
              </div>
            ))}
          </div>

          {/* Download full grid */}
          {tutorialGridUrl && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(tutorialGridUrl, "pencil-tutorial-4step-grid")}
                className="gap-2 rounded-none border-graphite text-graphite hover:bg-paper-warm font-sans text-xs tracking-widest uppercase"
              >
                <Download className="w-3.5 h-3.5" />
                Download Tutorial Grid
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Individual Cards View ── */}
      {(viewMode === "cards" || !allStagesReady) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STAGES.map((stageDef, idx) => {
            const src = getStageImageSrc(idx);
            const loading = isStageLoading(idx);
            const ready = isStageReady(idx);

            return (
              <div
                key={idx}
                className="bg-paper-warm overflow-hidden"
                style={{ border: '1px solid #c8c0b0' }}
              >
                {/* Image area */}
                <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                  {ready && src ? (
                    <>
                      <img
                        src={src}
                        alt={`Stage ${idx + 1}: ${stageDef.name}`}
                        className="w-full h-full object-cover block"
                      />
                      {/* Roman numeral overlay */}
                      <div className="absolute top-3 left-4 pointer-events-none">
                        <span
                          className="font-serif text-2xl font-normal leading-none select-none"
                          style={{ color: 'rgba(60, 52, 42, 0.50)' }}
                        >
                          {ROMAN[idx]}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(src, `Stage ${idx + 1} - ${stageDef.name}`)}
                        className="absolute bottom-3 right-3 bg-paper/90 hover:bg-paper border border-paper-rule p-1.5 transition-opacity opacity-0 hover:opacity-100 group-hover:opacity-100"
                        aria-label={`Download Stage ${idx + 1}`}
                      >
                        <Download className="w-3.5 h-3.5 text-graphite" />
                      </button>
                    </>
                  ) : loading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-paper-warm gap-3">
                      <Loader2 className="w-6 h-6 text-graphite animate-spin" />
                      <p className="font-cormorant text-xs text-graphite-light">Drawing stage {idx + 1}…</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-paper-warm">
                      <ImageIcon className="w-8 h-8 text-paper-rule" />
                    </div>
                  )}
                </div>

                {/* Card text */}
                <div className="px-4 py-3 border-t" style={{ borderColor: '#c8c0b0' }}>
                  <p className="sketch-stage-label mb-0.5">Stage {ROMAN[idx]}</p>
                  <h3 className="font-serif text-sm font-normal text-graphite leading-snug mb-1">
                    {stageDef.name}
                  </h3>
                  <p className="font-cormorant text-xs text-graphite-light leading-relaxed">
                    {stageDef.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
