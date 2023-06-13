export interface DeleteMemberForm {
  newThreshold: number;
  title: string;
  description: string;
}

export type DeleteMemberWizardContext = {
  membersCount: number;
  threshold: number;
  memberId: string;
};
