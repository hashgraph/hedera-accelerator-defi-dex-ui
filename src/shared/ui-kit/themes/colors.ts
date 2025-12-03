/**
 * Dark theme colors matching the landing page
 */
export const DarkTheme = {
  bg: "#0A0A0F",
  bgSecondary: "#12121A",
  bgCard: "rgba(255,255,255,0.02)",
  bgCardHover: "rgba(255,255,255,0.04)",
  bgInput: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.1)",
  borderFocus: "rgba(126, 34, 206, 0.5)",
  text: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.5)",
  accent: "#7E22CE",
  accentLight: "#A855F7",
  accentGradient: "linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)",
  success: "#4ADE80",
  error: "#F87171",
  navbarBg: "rgba(10, 10, 15, 0.8)",
};

/**
 * Light theme colors
 */
export const LightTheme = {
  bg: "#F8FAFC",
  bgSecondary: "#FFFFFF",
  bgCard: "rgba(255,255,255,0.8)",
  bgCardHover: "rgba(255,255,255,0.95)",
  bgInput: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  borderHover: "rgba(0,0,0,0.15)",
  borderFocus: "rgba(126, 34, 206, 0.5)",
  text: "#1A1A2E",
  textSecondary: "rgba(26,26,46,0.7)",
  textMuted: "rgba(26,26,46,0.5)",
  accent: "#7E22CE",
  accentLight: "#A855F7",
  accentGradient: "linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)",
  success: "#22C55E",
  error: "#EF4444",
  navbarBg: "rgba(255, 255, 255, 0.9)",
};

export type ThemeColors = typeof DarkTheme;

export const Color = {
  /**
   * V1 Colors [Deprecated] - Remove once all colors are migrated to the V2 color palette.
   */
  Text_Primary: "#1C2B36",
  White_01: "#FCFCFC",
  White_02: "#FFFFFF",
  Black_01: "#0F1517",
  Black_02: "#1F2B2F",
  Grey_01: "#DBDEDF",
  Grey_02: "#526065",
  Grey_03: "#757575",
  Teal_01: "#00BAC6",
  Teal_02: "#007F87",
  Green_01: "#79B54A",
  Green_01_Opaque: "rgba(121, 181, 74, 0.5)",
  Green_02: "#32A452",
  Red_01: "#EE2B00",
  Red_01_Opaque: "rgba(238, 43, 0, 0.5)",
  Red_02: "#AC1F00",
  Red_03: "#DF5656",
  Yellow_01: "#F9C80E",
  Yellow__01_Opaque: "rgba(249, 200, 14, 0.5)",
  Yellow_02: "#906A08",
  Blue_01: "#009FE3",
  Blue_02: "#000AFF",
  /**
   * V2 Colors
   */
  Primary_Bg: "#F8FAFC",
  Neutral: {
    _50: "#fafafa",
    _100: "#f5f5f5",
    _200: "#e5e5e5",
    _300: "#d4d4d4",
    _400: "#a3a3a3",
    _500: "#737373",
    _600: "#525252",
    _700: "#404040",
    _800: "#262626",
    _900: "#171717",
  },
  Primary: {
    _50: "#FAF5FF",
    _100: "#F3E8FF",
    _200: "#E9D5FF",
    _300: "#D8B4FE",
    _400: "#C084FC",
    _500: "#A855F7",
    _600: "#9333EA",
    _700: "#7E22CE",
    _800: "#6B21A8",
    _900: "#581C87",
  },
  Grey_Blue: {
    _50: "#F7F9FA",
    _100: "#EDF3F5",
    _200: "#CADAE0",
    _300: "#9BBAC5",
    _400: "#839CA5",
    _500: "#6A7E85",
    _600: "#526065",
    _700: "#39464A",
    _800: "#1F2B2F",
    _900: "#0F1517",
  },
  Blue: {
    _50: "#EBF4FA",
    _100: "#BFDCEC",
    _200: "#95C9E4",
    _300: "#5AADDB",
    _400: "#2B95D0",
    _500: "#007FC6",
    _600: "#0069C5",
    _700: "#00489F",
    _800: "#002E87",
    _900: "#001B52",
  },
  Success: {
    _50: "#EFFAEB",
    _100: "#CCF3BA",
    _200: "#AAF189",
    _300: "#6BEC3F",
    _400: "#44DF0F",
    _500: "#3FC600",
    _600: "#20AF00",
    _700: "#0A9800",
    _800: "#008716",
    _900: "#00520E",
  },
  Warning: {
    _50: "#FAF8EB",
    _100: "#FBF5BE",
    _200: "#FBF191",
    _300: "#F9E748",
    _400: "#F0DA19",
    _500: "#C6B200",
    _600: "#B9A701",
    _700: "#AC9B02",
    _800: "#877900",
    _900: "#665C00",
  },
  Destructive: {
    _50: "#FAEEEB",
    _100: "#FAC5B9",
    _200: "#FA9B86",
    _300: "#F9795C",
    _400: "#F85632",
    _500: "#EE2B00",
    _600: "#D72700",
    _700: "#C42400",
    _800: "#AC1F00",
    _900: "#661300",
  },
  White: "#FFFFFF",
  Black: "#000000",
  /**
   * Modern UI Effects
   */
  Gradient: {
    Primary: "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)",
    PrimaryHover: "linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)",
    Success: "linear-gradient(135deg, #3FC600 0%, #20AF00 100%)",
    Subtle: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
  },
  Shadow: {
    Soft: "0 2px 8px rgba(0, 0, 0, 0.06)",
    Medium: "0 4px 16px rgba(0, 0, 0, 0.08)",
    Strong: "0 8px 32px rgba(0, 0, 0, 0.12)",
    Primary: "0 4px 14px rgba(168, 85, 247, 0.25)",
    PrimaryHover: "0 6px 20px rgba(168, 85, 247, 0.35)",
    Card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.05)",
    CardHover: "0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.08)",
  },
  /**
   * Private DAO indicator - subtle purple/violet tint instead of harsh yellow
   */
  Private: {
    Bg: "#F8F5FF",
    BgHover: "#F0EBFF",
    Border: "#E4D9FC",
    Accent: "#8B5CF6",
  },
};
