export interface ChangeThresholdForm {
  newThreshold: number;
  title: string;
  description: string;
}
export type ChangeThresholdWizardContext = {
  membersCount: number;
  threshold: number;
};
