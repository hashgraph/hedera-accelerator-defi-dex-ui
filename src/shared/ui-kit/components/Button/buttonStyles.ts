import { theme, ComponentStyleConfig } from "@chakra-ui/react";
import { Color, DarkTheme, TextStyles } from "../../themes";

const primary = {
  ...TextStyles["p small semibold"],
  bg: DarkTheme.accentGradient,
  color: Color.White,
  padding: "0 24px",
  borderRadius: "full",
  boxShadow: "none",
  transition: "all 0.2s ease-in-out",
  ":hover": {
    bg: "linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)",
    boxShadow: "0 10px 30px rgba(126, 34, 206, 0.4)",
    transform: "translateY(-2px)",
  },
  ":focus": {
    bg: DarkTheme.accentGradient,
    boxShadow: "0 0 0 3px rgba(126, 34, 206, 0.3)",
  },
  ":active": {
    transform: "translateY(0)",
    boxShadow: "none",
  },
  ":disabled": {
    bg: "rgba(255,255,255,0.1)",
    color: DarkTheme.textMuted,
    boxShadow: "none",
    transform: "none",
  },
  ":hover:disabled": {
    bg: "rgba(255,255,255,0.1)",
    color: DarkTheme.textMuted,
    transform: "none",
  },
};

/**
 * Base Chakra UI styles and variants for the Hedera DEX Button and IconButton components.
 */
export const ButtonStyles: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    primary: {
      ...primary,
    },
    secondary: {
      ...TextStyles["p small semibold"],
      bg: "transparent",
      color: "var(--text-color)",
      padding: "0 24px",
      borderRadius: "full",
      border: "1px solid var(--border-color)",
      boxShadow: "none",
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: "var(--bg-card-hover)",
        borderColor: "var(--border-hover)",
        boxShadow: "none",
        transform: "translateY(-2px)",
      },
      ":focus": {
        bg: "transparent",
        boxShadow: "0 0 0 3px var(--border-color)",
      },
      ":active": {
        transform: "translateY(0)",
      },
      ":disabled": {
        bg: "transparent",
        color: "var(--text-muted)",
        borderColor: "var(--border-color)",
        boxShadow: "none",
        transform: "none",
      },
      ":hover:disabled": {
        bg: "transparent",
        transform: "none",
      },
    },
    ternary: {
      bg: DarkTheme.bgCard,
      border: `1px solid ${DarkTheme.border}`,
      borderRadius: "full",
      padding: "0rem 2rem",
      ...TextStyles.h4,
      color: DarkTheme.text,
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: DarkTheme.bgCardHover,
        borderColor: DarkTheme.borderHover,
      },
    },
    cancel: {},
    purple: {
      ...TextStyles["p small semibold"],
      bg: DarkTheme.accentGradient,
      color: Color.White,
      padding: "0 24px",
      borderRadius: "full",
      boxShadow: "none",
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: "linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)",
        boxShadow: "0 10px 30px rgba(126, 34, 206, 0.4)",
        transform: "translateY(-2px)",
      },
      ":focus": {
        bg: DarkTheme.accentGradient,
        boxShadow: "0 0 0 3px rgba(126, 34, 206, 0.3)",
      },
      ":active": {
        transform: "translateY(0)",
        boxShadow: "none",
      },
      ":disabled": {
        bg: "rgba(255,255,255,0.1)",
        color: DarkTheme.textMuted,
        boxShadow: "none",
        transform: "none",
      },
      ":hover:disabled": {
        bg: "rgba(255,255,255,0.1)",
        color: DarkTheme.textMuted,
        transform: "none",
      },
    },
    "new-proposal": {
      ...primary,
      minWidth: "250px",
    },
    "switch-token-inputs": (props) => ({
      ...theme.components.Button.variants?.outline(props),
      height: "48px",
      width: "48px",
      bg: DarkTheme.bgCard,
      border: `1px solid ${DarkTheme.border}`,
      borderRadius: "12px",
      boxShadow: "none",
      ":hover": {
        bg: DarkTheme.bgCardHover,
      },
    }),
    settings: {
      height: "36px",
      width: "fit-content",
      padding: "0.5rem 1rem",
      bg: DarkTheme.bgCard,
      border: `1px solid ${DarkTheme.border}`,
      borderRadius: "full",
      boxShadow: "none",
      color: DarkTheme.text,
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: DarkTheme.bgCardHover,
        borderColor: DarkTheme.borderHover,
        boxShadow: "none",
      },
    },
    link: {
      ...TextStyles.link,
      height: "fit-content",
      width: "fit-content",
      bg: "transparent",
      padding: 0,
      margin: "0 -0.25rem",
      color: DarkTheme.accentLight,
    },
    "token-selector": {
      padding: "0 1rem",
      minWidth: "120px",
      bg: "transparent",
      border: "1px solid transparent",
      color: DarkTheme.text,
      _hover: {
        bg: "transparent",
        border: `1px solid ${DarkTheme.borderHover}`,
        boxShadow: "none",
      },
      _focus: {
        bg: "transparent",
      },
    },
  },
  defaultProps: {
    variant: "primary",
  },
};
