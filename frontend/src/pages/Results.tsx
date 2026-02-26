import { Link, useParams } from "@tanstack/react-router";
import { useJob } from "@/hooks/useQueries";
import GalleryView from "@/components/GalleryView";
import { Loader2, AlertCircle, Home, RefreshCw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobStatus } from "@/backend";

export default function Results() {
  const { id } = useParams({ from: "/results/$id" });

  const jobId = id ? BigInt(id) : null;
  const { data: job, isLoading, isError, refetch } = useJob(jobId);

  if (!id) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-lg p-10">
          <AlertCircle size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
            No Sketch Job Found
          </h2>
          <p className="text-muted-foreground mb-6">
            It looks like you navigated here directly. Upload a photo to get
            started.
          </p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
              <Home size={16} />
              Go Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your sketch job...</p>
        </div>
      </main>
    );
  }

  if (isError || !job) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-lg p-10">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
            Something Went Wrong
          </h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load your sketch job. Please try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-border text-foreground hover:border-primary hover:text-primary gap-2"
            >
              <RefreshCw size={16} />
              Retry
            </Button>
            <Link to="/">
              <Button className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
                <Home size={16} />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (job.status === JobStatus.failed) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-lg p-10">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
            Sketch Generation Failed
          </h2>
          <p className="text-muted-foreground mb-6">
            {job.errorMessage
              ? "The job encountered an issue. Please try uploading your photo again."
              : "An unexpected error occurred. Please try again."}
          </p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
              <Pencil size={16} />
              Try Again
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const imageUrl = job.uploadedImage.getDirectURL();

  return (
    <main className="min-h-screen bg-background">
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            YOUR RESULTS
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Your Pencil Sketch Stages
          </h1>
          <p className="text-muted-foreground">
            All 5 progressive stages of your pencil sketch transformation.
            Hover over any stage to download it.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <GalleryView imageUrl={imageUrl} />

          <div className="mt-12 text-center">
            <Link to="/">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
              >
                <Pencil size={16} />
                Create Another Sketch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
