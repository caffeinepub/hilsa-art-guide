import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";

module {
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
      #success : Job;
      #error : JobError;
    };

    public type Job = {
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

  type OldActor = {
    jobs : Map.Map<Nat, InternalJob>;
    nextJobId : Nat;
  };

  type NewActor = {
    jobs : Map.Map<Nat, InternalJob>;
    nextJobId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
