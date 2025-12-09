import { selectAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { TextStyles, Color, DarkTheme } from "../../themes";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(selectAnatomy.keys);

const formTokenSelector = definePartsStyle({
  field: {
    ...TextStyles["p small regular"],
    height: "40px",
    padding: "0.125rem 1rem",
    background: "var(--input-bg, transparent)",
    color: "var(--text-color, inherit)",
    border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
    borderRadius: "full",
    transition: "all 0.2s ease-in-out",
    _hover: {
      borderColor: "var(--border-hover, rgba(255,255,255,0.1))",
    },
    _focus: {
      borderColor: DarkTheme.accent,
      boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
    },
  },
  icon: {
    color: "var(--text-muted, rgba(255,255,255,0.5))",
  },
});

const tokenSymbolSelector = definePartsStyle({
  field: {
    ...TextStyles.b1,
    height: "61px",
    padding: "0.5rem",
    background: "var(--input-bg, transparent)",
    color: "var(--text-color, inherit)",
    border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
    borderLeft: "none",
    borderRadius: 0,
  },
  icon: {
    color: "var(--text-muted, rgba(255,255,255,0.5))",
    fontSize: "0.5rem",
  },
});

const dropDownSelector = definePartsStyle({
  field: {
    ...TextStyles.b1,
    height: "45.52px",
    padding: "0.5rem",
    background: "var(--input-bg, transparent)",
    color: "var(--text-color, inherit)",
    border: "1px solid var(--border-color, rgba(255,255,255,0.06))",
    borderRadius: "12px",
  },
  icon: {
    color: "var(--text-muted, rgba(255,255,255,0.5))",
    fontSize: "0.5rem",
  },
});

/**
 * Chakra UI styles and variants for the Hedera DEX Select components
 * and sub-component parts.
 */
export const SelectStyles = defineMultiStyleConfig({
  baseStyle: {},
  sizes: {},
  variants: { formTokenSelector, tokenSymbolSelector, dropDownSelector },
  defaultProps: {},
});
