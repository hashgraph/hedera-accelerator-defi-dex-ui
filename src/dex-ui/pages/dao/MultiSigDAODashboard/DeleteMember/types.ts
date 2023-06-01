export interface DeleteMemberForm {
  newThreshold: number;
}

export type DeleteMemberWizardContext = {
  membersCount: number;
  threshold: number;
  memberId: string;
};
