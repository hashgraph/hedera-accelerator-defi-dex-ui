import { Color, DarkTheme, TextStyles } from "../../../themes";
import { ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX Input components
 * and sub-component parts.
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
        background: DarkTheme.bgInput,
        color: DarkTheme.text,
        padding: "14px 12px",
        border: `1px solid ${DarkTheme.border}`,
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
        _placeholder: {
          color: DarkTheme.textMuted,
        },
        _hover: {
          borderColor: DarkTheme.borderHover,
        },
        _focus: {
          borderColor: DarkTheme.accent,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
      },
    },
    "input-v2": {
      field: {
        bg: DarkTheme.bgInput,
        color: DarkTheme.text,
        border: `1px solid ${DarkTheme.border}`,
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
        _placeholder: {
          ...TextStyles["p small regular"],
          color: DarkTheme.textMuted,
        },
        _hover: {
          borderColor: DarkTheme.borderHover,
        },
        _focus: {
          borderColor: DarkTheme.accent,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
      },
    },
    "form-input": {
      field: {
        bg: DarkTheme.bgInput,
        color: DarkTheme.text,
        border: `1px solid ${DarkTheme.border}`,
        boxShadow: "none",
        borderRadius: "12px",
        padding: "16px",
        height: "52px",
        transition: "all 0.2s ease-in-out",
        "::placeholder": {
          fontSize: "16px",
          lineHeight: "19px",
          fontWeight: "400",
          color: DarkTheme.textMuted,
        },
        _hover: {
          borderColor: DarkTheme.borderHover,
        },
        _focus: {
          borderColor: DarkTheme.accent,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
        _invalid: {
          borderColor: DarkTheme.error,
          boxShadow: `0 0 0 3px rgba(248, 113, 113, 0.2)`,
        },
      },
    },
    filter: {
      field: {
        bg: DarkTheme.bgInput,
        color: DarkTheme.text,
        border: `1px solid ${DarkTheme.border}`,
        minWidth: "200px",
        borderRadius: "full",
        padding: "0.5rem 1rem",
        transition: "all 0.2s ease-in-out",
        _placeholder: {
          color: DarkTheme.textMuted,
        },
        _hover: {
          borderColor: DarkTheme.borderHover,
        },
        _focus: {
          borderColor: DarkTheme.accent,
          boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
        },
      },
    },
  },
  defaultProps: {},
};
