import { selectAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { TextStyles, Color, DarkTheme } from "../../themes";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(selectAnatomy.keys);

const formTokenSelector = definePartsStyle({
  field: {
    ...TextStyles["p small regular"],
    height: "40px",
    padding: "0.125rem 1rem",
    background: DarkTheme.bgInput,
    color: DarkTheme.text,
    border: `1px solid ${DarkTheme.border}`,
    borderRadius: "full",
    transition: "all 0.2s ease-in-out",
    _hover: {
      borderColor: DarkTheme.borderHover,
    },
    _focus: {
      borderColor: DarkTheme.accent,
      boxShadow: `0 0 0 3px rgba(126, 34, 206, 0.2)`,
    },
  },
  icon: {
    color: DarkTheme.textSecondary,
  },
});

const tokenSymbolSelector = definePartsStyle({
  field: {
    ...TextStyles.b1,
    height: "61px",
    padding: "0.5rem",
    background: DarkTheme.bgInput,
    color: DarkTheme.text,
    border: `1px solid ${DarkTheme.border}`,
    borderLeft: "none",
    borderRadius: 0,
  },
  icon: {
    color: DarkTheme.textSecondary,
    fontSize: "0.5rem",
  },
});

const dropDownSelector = definePartsStyle({
  field: {
    ...TextStyles.b1,
    height: "45.52px",
    padding: "0.5rem",
    background: DarkTheme.bgInput,
    color: DarkTheme.text,
    border: `1px solid ${DarkTheme.border}`,
    borderRadius: "12px",
  },
  icon: {
    color: DarkTheme.textSecondary,
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
