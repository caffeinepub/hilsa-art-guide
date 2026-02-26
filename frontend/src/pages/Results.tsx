import { useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import GalleryView from '../components/GalleryView';
import { useJob } from '../hooks/useQueries';
import { JobStatus } from '../backend';
import { Loader2 } from 'lucide-react';

export default function Results() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();

  // If no job ID, redirect silently to home
  useEffect(() => {
    if (!id) {
      navigate({ to: '/' });
    }
  }, [id, navigate]);

  const jobId = id ? BigInt(id) : null;
  const { data: job, isLoading, error } = useJob(jobId);

  // While redirecting or no id — render nothing
  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
          <p className="font-serif text-lg">Loading your artwork…</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <p className="font-serif text-2xl text-foreground">Unable to load results</p>
          <p className="text-muted-foreground max-w-sm">
            We couldn't find the requested artwork. It may have expired or been removed.
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-6 py-2 bg-gold text-ink font-medium rounded hover:opacity-90 transition-opacity"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (job.status === JobStatus.pending || job.status === JobStatus.inProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
          <p className="font-serif text-lg">Processing your pencil sketch…</p>
          <p className="text-sm">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (job.status === JobStatus.failed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <p className="font-serif text-2xl text-foreground">Processing Failed</p>
          <p className="text-muted-foreground max-w-sm">
            {job.errorMessage || 'Something went wrong while processing your image.'}
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-6 py-2 bg-gold text-ink font-medium rounded hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GalleryView
        uploadedImageSrc={job.uploadedImage.getDirectURL()}
        jobId={id}
        backendStages={job.stages}
      />
    </div>
  );
}
