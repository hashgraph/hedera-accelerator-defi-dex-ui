export enum ProposalType {
  HIP = "HIP",
}

export enum HIPStatus {
  Draft = "Draft",
  Review = "Review",
  LastCall = "Last Call",
  Active = "Active",
  Inactive = "Inactive",
  Deferred = "Deferred",
  Rejected = "Rejected",
  Withdrawn = "Withdrawn",
  Accepted = "Accepted",
  Final = "Final",
  Replaced = "Replaced",
}

export enum HIPType {
  StandardsTrack = "Standards Track",
  Informational = "Informational",
  Process = "Process",
}

export enum HIPCateogry {
  Core = "Core",
  Service = "Service",
  Mirror = "Mirror",
  Application = "Application",
}

export interface HIPMetaData {
  proposalType: ProposalType;
  /** HIP number (this is determined by the HIP editor) */
  hip: number;
  /** HIP title */
  title: string;
  /** A list of the author’s or authors’ name(s) and/or username(s), or name(s) and email(s). */
  authors: Array<{ name: string; email: string }>;
  /** Draft | Review | Last Call | Active | Inactive | Deferred | Rejected | Withdrawn | Accepted | Final | Replaced */
  status: HIPStatus;
  /** Standards Track | Informational | Process */
  type: HIPType;
  /** Core | Service | Mirror | Application */
  category: HIPCateogry;
  /** Yes | No */
  doesNeedCouncilApproval: boolean;
  /** date created on */
  created: string;
  /** a URL pointing to the official discussion thread */
  discussionLink: string;
  /** list of dates */
  updated: string[];
  /** HIP number(s) */
  requires: number[];
  /** HIP number(s) */
  replaces: number[];
  /** HIP number(s) */
  supersededBy: number[];
  body: {
    abstract: string;
    motivation: string;
    rationale: string;
    user_stories: string;
    specification: string;
    backwards_compatibility: string;
    security_implications: string;
    how_to_teach_this: string;
    reference_implementation: string;
    rejected_ideas: string;
    open_issues: string;
    references: string;
    copyright_license: string;
  };
}

export type ProposalMetaData = HIPMetaData;
