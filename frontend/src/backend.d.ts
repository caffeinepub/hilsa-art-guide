import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Job {
    id: bigint;
    stages: Array<StageResult>;
    status: JobStatus;
    owner: string;
    createdAt: Time;
    errorMessage?: string;
    expiryReason?: ExpiryReason;
    lastUpdated: Time;
    uploadedImage: ExternalBlob;
}
export type Time = bigint;
export type RetryJobResponse = {
    __kind__: "error";
    error: JobError;
} | {
    __kind__: "success";
    success: {
        jobId: bigint;
    };
};
export type JobError = {
    __kind__: "rateLimitExceeded";
    rateLimitExceeded: {
        message: string;
    };
} | {
    __kind__: "invalidState";
    invalidState: {
        message: string;
    };
} | {
    __kind__: "unauthorized";
    unauthorized: {
        message: string;
    };
} | {
    __kind__: "jobNotFound";
    jobNotFound: {
        message: string;
    };
};
export interface StageResult {
    status: JobStatus;
    stageNumber: bigint;
    resultImage?: ExternalBlob;
    stageName: string;
}
export type JobResponse = {
    __kind__: "error";
    error: JobError;
} | {
    __kind__: "success";
    success: Job;
};
export type CreateJobResponse = {
    __kind__: "error";
    error: JobError;
} | {
    __kind__: "success";
    success: {
        jobId: bigint;
    };
};
export enum ExpiryReason {
    timeout = "timeout"
}
export enum JobStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress",
    failed = "failed"
}
export interface backendInterface {
    cancelJob(jobId: bigint): Promise<void>;
    createJob(uploadedImage: ExternalBlob): Promise<CreateJobResponse>;
    getJob(jobId: bigint): Promise<Job | null>;
    getJobsByStatus(status: JobStatus, limit: bigint): Promise<Array<Job>>;
    getJobsSortedAsc(limit: bigint): Promise<Array<Job>>;
    getMyJobs(): Promise<Array<Job>>;
    processJob(jobId: bigint): Promise<JobResponse>;
    retryFailedJob(jobId: bigint): Promise<RetryJobResponse>;
}
