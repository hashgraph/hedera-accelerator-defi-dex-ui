export interface DAOSettingsForm {
  name: string;
  description: string;
  logoUrl?: string;
  isPublic?: boolean;
  daoLinks: Record<"value", string>[];
}

export interface MintNFTTokensFormData {
  tokenLinks: Record<"value", string>[];
}
