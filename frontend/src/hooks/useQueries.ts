import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import {
  Job,
  JobResponse,
  JobStatus,
  CreateJobResponse,
  RetryJobResponse,
  JobError,
  ExternalBlob,
} from "../backend";

// Helper to extract error message from JobError discriminated union
function extractJobErrorMessage(error: JobError): string {
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
      return "An unknown error occurred";
  }
}

// Hook to get a single job by ID, with polling while pending/inProgress
// getJob returns Job | null directly (not wrapped in a variant)
export function useJob(jobId: bigint | null) {
  const { actor, isFetching } = useActor();

  // Guard: only enable when jobId is a valid non-null bigint
  const isValidJobId = jobId !== null && jobId !== undefined;

  return useQuery<Job | null>({
    queryKey: ["job", jobId?.toString()],
    queryFn: async () => {
      if (!actor || !isValidJobId) return null;
      const result = await actor.getJob(jobId!);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && isValidJobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      if (
        data.status === JobStatus.completed ||
        data.status === JobStatus.failed
      ) {
        return false;
      }
      return 3000;
    },
  });
}

// Hook to get all jobs for the current user
// getMyJobs returns Job[] directly
export function useMyJobs() {
  const { actor, isFetching } = useActor();

  return useQuery<Job[]>({
    queryKey: ["myJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

// Hook to create a new job
export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, ExternalBlob>({
    mutationFn: async (uploadedImage: ExternalBlob) => {
      if (!actor) throw new Error("Actor not initialized");
      const response: CreateJobResponse = await actor.createJob(uploadedImage);
      if (response.__kind__ === "error") {
        throw new Error(extractJobErrorMessage(response.error));
      }
      const jobId = response.success.jobId;
      // Guard: ensure the returned job ID is valid
      if (jobId === undefined || jobId === null) {
        throw new Error("No job ID was provided — please try again.");
      }
      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myJobs"] });
    },
  });
}

// Hook to process a job
// processJob returns JobResponse (variant), unwrap it properly
export function useProcessJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Job, Error, bigint>({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      const response: JobResponse = await actor.processJob(jobId);
      if (response.__kind__ === "error") {
        throw new Error(extractJobErrorMessage(response.error));
      }
      return response.success;
    },
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ["job", job.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["myJobs"] });
    },
  });
}

// Hook to retry a failed job
export function useRetryFailedJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, bigint>({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      const response: RetryJobResponse = await actor.retryFailedJob(jobId);
      if (response.__kind__ === "error") {
        throw new Error(extractJobErrorMessage(response.error));
      }
      return response.success.jobId;
    },
    onSuccess: (jobId) => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["myJobs"] });
    },
  });
}
