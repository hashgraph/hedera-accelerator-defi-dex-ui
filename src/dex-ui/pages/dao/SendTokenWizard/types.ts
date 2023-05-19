export type SendTokenWizardContext = {
  safeAccountId: string;
};

export interface SendTokenForm {
  recipientAccountId: string;
  tokenId: string;
  amount: number;
  decimals: number;
}
