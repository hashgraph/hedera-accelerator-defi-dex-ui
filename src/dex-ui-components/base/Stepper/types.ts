export interface ProposalState {
  status: string;
  iconType: string;
  timeRemaining?: string | undefined;
}
export interface StepperState {
  states: ProposalState[];
}

export enum ProposalStateIcon {
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Disabled = "Disabled",
}
