export interface SettingsForm {
  name: string;
  description: string;
  logoUrl: string;
  infoUrl: string;
  type: string;
  webLinks: Record<"value", string>[];
}
