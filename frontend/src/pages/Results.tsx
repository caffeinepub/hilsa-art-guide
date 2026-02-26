import { useEffect } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import GalleryView from '../components/GalleryView';
import { useJob } from '../hooks/useQueries';
import { JobStatus } from '../backend';
import { Loader2, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Results() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate({ to: '/' });
    }
  }, [id, navigate]);

  const jobId = id ? BigInt(id) : null;
  const { data: job, isLoading, error, refetch } = useJob(jobId);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="font-serif text-xl text-foreground">No sketch job found.</p>
          <p className="text-muted-foreground text-sm">
            Please upload a photo to get started.
          </p>
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="font-serif text-sm">Loading your sketch job…</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="font-serif text-xl text-foreground">Something went wrong.</p>
          <p className="text-muted-foreground text-sm">
            We couldn't load your sketch job. Please try again or start a new one.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (job.status === JobStatus.failed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="font-serif text-xl text-foreground">Sketch job failed.</p>
          <p className="text-muted-foreground text-sm">
            {job.errorMessage
              ? "The job encountered an issue. Please try uploading your photo again."
              : "An unexpected error occurred. Please try again."}
          </p>
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Try Again
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const uploadedImageSrc = job.uploadedImage.getDirectURL();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Your Pencil Sketch
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            5 progressive stages — from light outline to fully detailed artwork
          </p>
        </div>

        <GalleryView
          uploadedImageSrc={uploadedImageSrc}
          jobId={String(job.id)}
          backendStages={job.stages}
        />

        {/* Back link */}
        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Create Another Sketch
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
