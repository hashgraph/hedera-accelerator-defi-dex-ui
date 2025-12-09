import { ComponentStyleConfig } from "@chakra-ui/react";
import { Color, TextStyles } from "../../themes";

/**
 * Base Chakra UI styles and variants for the Hedera DEX TextArea components.
 * Uses CSS variables set by ThemeProvider for dynamic theming.
 */
export const TextAreaStyles: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    "input-text-area": {
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
    defaultProps: {},
  },
};
