import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type JobStatus = {
    #pending;
    #inProgress;
    #completed;
    #failed;
  };

  type ExpiryReason = {
    #timeout;
  };

  module StageResult {
    public type T = {
      stageNumber : Nat;
      stageName : Text;
      resultImage : ?Storage.ExternalBlob;
      status : JobStatus;
    };

    public func compare(r1 : T, r2 : T) : Order.Order {
      Nat.compare(r1.stageNumber, r2.stageNumber);
    };
  };

  module V3 {
    public type StageResult = StageResult.T;

    public type JobError = {
      #rateLimitExceeded : { message : Text };
      #jobNotFound : { message : Text };
      #unauthorized : { message : Text };
      #invalidState : { message : Text };
    };

    public type CreateJobResponse = {
      #success : { jobId : Nat };
      #error : JobError;
    };

    public type RetryJobResponse = {
      #success : { jobId : Nat };
      #error : JobError;
    };

    public type JobResponse = {
      id : Nat;
      status : JobStatus;
      uploadedImage : Storage.ExternalBlob;
      stages : [StageResult];
      owner : Text;
      createdAt : Time.Time;
      lastUpdated : Time.Time;
      errorMessage : ?Text;
      expiryReason : ?ExpiryReason;
    };
  };

  type InternalJob = {
    id : Nat;
    status : JobStatus;
    uploadedImage : Storage.ExternalBlob;
    stages : [StageResult.T];
    owner : Principal;
    createdAt : Time.Time;
    lastUpdated : Time.Time;
    errorMessage : ?Text;
    expiryReason : ?ExpiryReason;
  };

  let jobs = Map.empty<Nat, InternalJob>();
  var nextJobId = 0;

  public shared ({ caller }) func createJob(uploadedImage : Storage.ExternalBlob) : async V3.CreateJobResponse {
    cleanUpExpiredJobs();

    let activeJobs = jobs.values().toArray().filter(
      func(job) {
        job.owner == caller and (Time.now() - job.createdAt < 24 * 60 * 60 * 1_000_000_000)
      }
    ).size();

    if (activeJobs >= 10) {
      return #error(#rateLimitExceeded({ message = "Rate limit exceeded. You have too many active or recent jobs." }));
    };

    let jobId = getNextJobId();

    let newJob : InternalJob = {
      id = jobId;
      status = #pending;
      uploadedImage;
      stages = [];
      owner = caller;
      createdAt = Time.now();
      lastUpdated = Time.now();
      errorMessage = null;
      expiryReason = null;
    };

    jobs.add(jobId, newJob);
    #success({ jobId });
  };

  public shared ({ caller }) func processJob(jobId : Nat) : async V3.JobResponse {
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (job.owner != caller) {
          Runtime.trap("Caller not authorized to process this job.");
        };

        let updatedJob = {
          job with
          status = #inProgress;
          lastUpdated = Time.now();
        };
        jobs.add(jobId, updatedJob);

        for (stageNumber in Nat.range(1, 6)) {
          let stageName = "Stage " # stageNumber.toText();

          let newStage : StageResult.T = {
            stageNumber;
            stageName;
            resultImage = null;
            status = #inProgress;
          };

          let jobWithNewStage = {
            updatedJob with
            stages = (updatedJob.stages.concat([newStage])).sort();
            lastUpdated = Time.now();
          };
          jobs.add(jobId, jobWithNewStage);
        };

        let finalJob = {
          updatedJob with
          status = #completed;
          lastUpdated = Time.now();
        };
        jobs.add(jobId, finalJob);

        {
          job with
          owner = job.owner.toText()
        };
      };
    };
  };

  public query ({ caller }) func getJob(jobId : Nat) : async ?V3.JobResponse {
    jobs.get(jobId).map(
      func(job) {
        { job with owner = job.owner.toText() };
      }
    );
  };

  public query ({ caller }) func getMyJobs() : async [V3.JobResponse] {
    jobs.values().toArray().filter(
      func(job) { job.owner == caller }
    ).map(
      func(job) { { job with owner = job.owner.toText() } }
    );
  };

  public query ({ caller }) func getJobsSortedAsc(limit : Nat) : async [V3.JobResponse] {
    let sorted = jobs.values().toArray().reverse();
    sorted.sliceToArray(0, Nat.min(limit, sorted.size())).map(
      func(job) { { job with owner = job.owner.toText() } }
    );
  };

  public query ({ caller }) func getJobsByStatus(status : JobStatus, limit : Nat) : async [V3.JobResponse] {
    let filtered = jobs.values().toArray().filter(func(job) { job.status == status });
    filtered.sliceToArray(0, Nat.min(limit, filtered.size())).map(
      func(job) { { job with owner = job.owner.toText() } }
    );
  };

  public shared ({ caller }) func retryFailedJob(jobId : Nat) : async V3.RetryJobResponse {
    switch (jobs.get(jobId)) {
      case (null) { #error(#jobNotFound({ message = "Job not found" })) };
      case (?job) {
        if (job.owner != caller) {
          return #error(#unauthorized({ message = "Caller not authorized to retry this job." }));
        };

        if (job.status != #failed) {
          return #error(#invalidState({ message = "Cannot retry a job that is not failed." }));
        };

        let resetJob = {
          job with
          status = #pending;
          errorMessage = null;
          stages = [];
          lastUpdated = Time.now();
          expiryReason = null;
        };
        jobs.add(jobId, resetJob);

        ignore processJob(jobId);
        #success({ jobId });
      };
    };
  };

  public shared ({ caller }) func cancelJob(jobId : Nat) : async () {
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) {
        if (job.owner != caller) {
          Runtime.trap("Caller not authorized to cancel this job.");
        };

        if (job.status != #inProgress) {
          Runtime.trap("Cannot cancel a job that is not in progress.");
        };

        let cancelledJob = { job with status = #failed; errorMessage = ?"Job cancelled by user" };
        jobs.add(jobId, cancelledJob);
      };
    };
  };

  func cleanUpExpiredJobs() {
    let expirationThreshold = 600_000_000_000;

    for ((jobId, job) in jobs.entries()) {
      if ((job.status == #pending or job.status == #inProgress) and
        (Time.now() - job.lastUpdated > expirationThreshold)) {
        let expiredJob = {
          job with
          status = #failed;
          errorMessage = ?"Job expired due to inactivity";
          expiryReason = ?#timeout;
          lastUpdated = Time.now();
        };
        jobs.add(jobId, expiredJob);
      };
    };
  };

  func getNextJobId() : Nat {
    let currentId = nextJobId;
    nextJobId += 1;
    currentId;
  };
};
