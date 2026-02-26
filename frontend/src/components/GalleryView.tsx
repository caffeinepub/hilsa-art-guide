import { useEffect, useRef, useState } from "react";
import { Download, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { generatePencilSketchStages, type StageProgressCallback } from "@/lib/pencilSketchUtils";

interface SketchStage {
  stageNumber: number;
  stageName: string;
  imageDataUrl: string | null;
  isLoading: boolean;
}

interface GalleryViewProps {
  imageUrl: string;
}

const STAGE_NAMES = [
  "Basic Outline",
  "Light Hatching",
  "Cross-Hatching",
  "Deep Shading",
  "Finished Portrait",
];

export default function GalleryView({ imageUrl }: GalleryViewProps) {
  const [stages, setStages] = useState<SketchStage[]>(
    Array.from({ length: 5 }, (_, i) => ({
      stageNumber: i + 1,
      stageName: STAGE_NAMES[i],
      imageDataUrl: null,
      isLoading: true,
    }))
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const onProgress: StageProgressCallback = (stageIndex, dataUrl) => {
      setStages((prev) =>
        prev.map((s, i) =>
          i === stageIndex
            ? { ...s, imageDataUrl: dataUrl, isLoading: false }
            : s
        )
      );
    };

    generatePencilSketchStages(imageUrl, onProgress).catch(console.error);
  }, [imageUrl]);

  const handleDownload = (dataUrl: string, stageNumber: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `hilsa-art-stage-${stageNumber}.png`;
    a.click();
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () =>
    setLightboxIndex((i) => (i !== null ? Math.max(0, i - 1) : null));
  const nextLightbox = () =>
    setLightboxIndex((i) => (i !== null ? Math.min(4, i + 1) : null));

  return (
    <div className="w-full">
      {/* Stage Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map((stage, index) => (
          <div key={stage.stageNumber} className="stage-card group">
            {/* Image area */}
            <div className="relative aspect-square bg-muted overflow-hidden">
              {stage.isLoading ? (
                <Skeleton className="w-full h-full rounded-none" />
              ) : stage.imageDataUrl ? (
                <>
                  <img
                    src={stage.imageDataUrl}
                    alt={`Stage ${stage.stageNumber}: ${stage.stageName}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => openLightbox(index)}
                      className="p-2 bg-background/80 rounded-full text-foreground hover:text-primary transition-colors"
                      aria-label="View full size"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(stage.imageDataUrl!, stage.stageNumber)
                      }
                      className="p-2 bg-background/80 rounded-full text-foreground hover:text-primary transition-colors"
                      aria-label="Download"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Failed
                </div>
              )}
            </div>

            {/* Card info */}
            <div className="p-3 bg-card">
              <p className="stage-label mb-1">STAGE {stage.stageNumber}</p>
              <p className="stage-title">{stage.stageName}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Download All */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
          onClick={() => {
            stages.forEach((s) => {
              if (s.imageDataUrl) handleDownload(s.imageDataUrl, s.stageNumber);
            });
          }}
          disabled={stages.some((s) => s.isLoading)}
        >
          <Download size={16} />
          Download All Stages
        </Button>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-foreground hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>

            {/* Image */}
            {stages[lightboxIndex]?.imageDataUrl && (
              <img
                src={stages[lightboxIndex].imageDataUrl!}
                alt={`Stage ${stages[lightboxIndex].stageNumber}`}
                className="w-full rounded-lg"
              />
            )}

            {/* Stage info */}
            <div className="mt-3 text-center">
              <p className="stage-label">
                STAGE {stages[lightboxIndex]?.stageNumber}
              </p>
              <p className="text-foreground font-semibold mt-1">
                {stages[lightboxIndex]?.stageName}
              </p>
            </div>

            {/* Navigation */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-2">
              <button
                onClick={prevLightbox}
                disabled={lightboxIndex === 0}
                className="pointer-events-auto p-2 bg-background/80 rounded-full text-foreground hover:text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextLightbox}
                disabled={lightboxIndex === 4}
                className="pointer-events-auto p-2 bg-background/80 rounded-full text-foreground hover:text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
