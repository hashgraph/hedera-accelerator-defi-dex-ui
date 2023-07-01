export interface SettingsForm {
  name: string;
  description: string;
  logoUrl: string;
  webLinks: Record<"value", string>[];
}
