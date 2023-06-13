export interface AddMemberForm {
  memberAddress: string;
  newThreshold: number;
  title: string;
  description: string;
}

export type AddMemberWizardContext = {
  threshold: number;
  membersCount: number;
};
