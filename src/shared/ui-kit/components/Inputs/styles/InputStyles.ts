import { Color, TextStyles } from "../../../themes";
import { ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX Input components
 * and sub-component parts.
 * Uses CSS variables set by ThemeProvider for dynamic theming.
 */
export const InputStyles: ComponentStyleConfig = {
  baseStyle: {
    field: {
      transition: "all 0.2s ease-in-out",
    },
  },
  sizes: {},
  variants: {
    "token-amount-input": {
      field: {
        ...TextStyles.h2,
        height: "fit-content",
        background: "var(--input-bg, transparent)",
        color: "var(--text-color, inherit)",
        padding: "14px 12px",
        border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
        _placeholder: {
          color: "var(--text-muted, rgba(255,255,255,0.5))",
        },
        _hover: {
          borderColor: "var(--border-hover, rgba(255,255,255,0.1))",
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
      },
    },
    "input-v2": {
      field: {
        bg: "var(--input-bg, transparent)",
        color: "var(--text-color, inherit)",
        border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
        _placeholder: {
          ...TextStyles["p small regular"],
          color: "var(--text-muted, rgba(255,255,255,0.5))",
        },
        _hover: {
          borderColor: "var(--border-hover, rgba(255,255,255,0.1))",
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
      },
    },
    "form-input": {
      field: {
        bg: "var(--input-bg, transparent)",
        color: "var(--text-color, inherit)",
        border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
        boxShadow: "none",
        borderRadius: "12px",
        padding: "16px",
        height: "52px",
        transition: "all 0.2s ease-in-out",
        "::placeholder": {
          fontSize: "16px",
          lineHeight: "19px",
          fontWeight: "400",
          color: "var(--text-muted, rgba(255,255,255,0.5))",
        },
        _hover: {
          borderColor: "var(--border-hover, rgba(255,255,255,0.1))",
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
        _invalid: {
          borderColor: Color.Destructive._500,
          boxShadow: `0 0 0 3px rgba(248, 113, 113, 0.2)`,
        },
      },
    },
    filter: {
      field: {
        bg: "var(--input-bg, transparent)",
        color: "var(--text-color, inherit)",
        border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
        minWidth: "200px",
        borderRadius: "full",
        padding: "0.5rem 1rem",
        transition: "all 0.2s ease-in-out",
        _placeholder: {
          color: "var(--text-muted, rgba(255,255,255,0.5))",
        },
        _hover: {
          borderColor: "var(--border-hover, rgba(255,255,255,0.1))",
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
      },
    },
  },
  defaultProps: {},
};
