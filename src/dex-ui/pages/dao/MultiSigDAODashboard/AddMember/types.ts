export interface AddMemberForm {
  memberAddress: string;
  newThreshold: number;
}

export type AddMemberWizardContext = {
  threshold: number;
  membersCount: number;
};
