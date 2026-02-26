import { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useCreateJob, useProcessJob } from "@/hooks/useQueries";
import { ExternalBlob, JobError } from "@/backend";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extractErrorMessage(error: JobError): string {
  switch (error.__kind__) {
    case "rateLimitExceeded":
      return error.rateLimitExceeded.message;
    case "jobNotFound":
      return error.jobNotFound.message;
    case "unauthorized":
      return error.unauthorized.message;
    case "invalidState":
      return error.invalidState.message;
    default:
      return "An unexpected error occurred.";
  }
}

export default function UploadInterface() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const createJobMutation = useCreateJob();
  const processJobMutation = useProcessJob();

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please upload a JPEG, PNG, or WebP image.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be under 10MB.";
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Read file as bytes
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      // Create job — this returns the bigint jobId or throws
      const jobId = await createJobMutation.mutateAsync(blob);

      // Guard: validate the returned job ID before proceeding
      if (jobId === undefined || jobId === null) {
        toast.error("No job ID was provided — please try again.");
        return;
      }

      const jobIdStr = jobId.toString();
      if (!jobIdStr || jobIdStr.trim() === "") {
        toast.error("No job ID was provided — please try again.");
        return;
      }

      setUploadProgress(100);
      toast.success("Portrait uploaded! Generating your sketch…");

      // Navigate to results using the correct route param name ($id)
      navigate({ to: `/results/${jobIdStr}` });

      // Kick off processing after navigation (fire-and-forget)
      processJobMutation.mutate(jobId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const isProcessing = isUploading || createJobMutation.isPending;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`upload-drop-zone cursor-pointer transition-all duration-300 ${
            isDragging ? "border-gold bg-gold/5 scale-[1.01]" : ""
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4 py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gold" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-ink mb-1">
                Drop your portrait here
              </p>
              <p className="text-sm text-ink-light/70">
                or click to browse — JPEG, PNG, WebP up to 10MB
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["Portrait", "Headshot", "Face Photo"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-gold/10 text-gold rounded-full border border-gold/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Preview + submit */
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-gold/20 bg-cream shadow-artistic">
            <img
              src={previewUrl!}
              alt="Selected portrait"
              className="w-full max-h-80 object-contain"
            />
            {!isProcessing && (
              <button
                onClick={clearSelection}
                className="absolute top-3 right-3 p-1.5 bg-ink/70 hover:bg-ink rounded-full text-cream transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isProcessing && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 bg-ink/60 px-4 py-2">
                <div className="flex items-center justify-between text-cream text-xs mb-1">
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-cream/20 rounded-full h-1.5">
                  <div
                    className="bg-gold h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-ink-light">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gold" />
              <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            </div>
            <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gold hover:bg-gold/90 text-ink font-semibold py-3 text-base"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading portrait…
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Generate Pencil Sketch
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
