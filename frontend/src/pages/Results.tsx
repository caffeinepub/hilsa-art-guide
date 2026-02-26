import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GalleryView from "@/components/GalleryView";
import { useJob, useRetryFailedJob } from "@/hooks/useQueries";
import { JobStatus } from "@/backend";

export default function Results() {
  // Route is defined as /results/$id — param name is "id"
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();

  // Validate id: must be present and non-empty
  const isValidJobId = !!id && id.trim() !== "";

  // Safely convert to BigInt only when valid
  const jobIdBigInt = isValidJobId ? BigInt(id!) : null;

  // Always call hooks at the top level
  const { data: job, isLoading, isError } = useJob(jobIdBigInt);
  const retryMutation = useRetryFailedJob();

  // Track whether we've started client-side generation
  const [clientGenStarted, setClientGenStarted] = useState(false);

  // Once we have a job with an uploaded image, mark generation as started
  useEffect(() => {
    if (job?.uploadedImage && !clientGenStarted) {
      setClientGenStarted(true);
    }
  }, [job?.uploadedImage, clientGenStarted]);

  const handleRetry = async () => {
    if (!jobIdBigInt) return;
    try {
      await retryMutation.mutateAsync(jobIdBigInt);
    } catch {
      // error handled by mutation
    }
  };

  // Early guard: no valid job ID provided
  if (!isValidJobId) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-ink mb-2">
            No Job ID Provided
          </h2>
          <p className="text-ink-light mb-6">
            No job ID was provided. Please start a new upload to generate your
            pencil sketch.
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="bg-gold hover:bg-gold/90 text-ink"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-3" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isError || !job) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-ink mb-2">
            Job Not Found
          </h2>
          <p className="text-ink-light mb-6">
            We couldn't find this job. It may have expired or been deleted.
          </p>
          <Button onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </main>
    );
  }

  // Failed state
  if (job.status === JobStatus.failed) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-semibold text-ink mb-3">
            Processing Failed
          </h2>
          <p className="text-ink-light mb-2">
            {job.errorMessage ||
              "Something went wrong while processing your portrait."}
          </p>
          {job.expiryReason && (
            <p className="text-xs text-ink-light/60 mb-4">
              Reason: Job expired due to inactivity.
            </p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" onClick={() => navigate({ to: "/" })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={handleRetry}
              disabled={retryMutation.isPending}
              className="bg-gold hover:bg-gold/90 text-ink"
            >
              {retryMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // For pending/inProgress AND completed: always show the gallery with client-side generation
  const uploadedImageSrc = job.uploadedImage.getDirectURL();

  const isPendingOrInProgress =
    job.status === JobStatus.pending || job.status === JobStatus.inProgress;

  const completedStages = job.stages.filter(
    (s) => s.status === JobStatus.completed
  ).length;

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 text-ink-light hover:text-ink transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink mb-3">
                Your Pencil Sketch Gallery
              </h1>
              <p className="text-ink-light max-w-2xl">
                Your portrait is being transformed through 5 progressive
                pencil-sketch stages — from raw structural outlines to a fully
                polished fine-art rendering.
              </p>
            </div>

            {isPendingOrInProgress && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg">
                <Loader2 className="w-4 h-4 text-gold animate-spin" />
                <div>
                  <p className="text-xs font-medium text-ink">
                    {job.status === JobStatus.pending
                      ? "Queued for processing"
                      : "Processing on server"}
                  </p>
                  {job.stages.length > 0 && (
                    <p className="text-xs text-ink-light">
                      {completedStages}/{job.stages.length} server stages done
                    </p>
                  )}
                </div>
              </div>
            )}

            {job.status === JobStatus.completed && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <Sparkles className="w-4 h-4 text-green-600" />
                <p className="text-xs font-medium text-green-700">
                  Processing complete
                </p>
              </div>
            )}
          </div>

          <div className="ink-divider mt-6" />
        </div>

        {/* Gallery — always rendered, handles its own per-stage loading */}
        <GalleryView
          uploadedImageSrc={uploadedImageSrc}
          jobId={id!}
          backendStages={job.stages}
        />
      </div>
    </main>
  );
}
