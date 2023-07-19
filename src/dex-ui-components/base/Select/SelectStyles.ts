import { selectAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { TextStyles, Color } from "../../themes";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(selectAnatomy.keys);

const formTokenSelector = definePartsStyle({
  field: {
    ...TextStyles["p small regular"],
    height: "40px",
    padding: "0.125rem 1rem",
    background: Color.Grey_Blue._50,
    border: `1px solid ${Color.Neutral._300}`,
    borderRadius: "0.25rem",
  },
});

const tokenSymbolSelector = definePartsStyle({
  field: {
    ...TextStyles.b1,
    height: "61px",
    padding: "0.5rem",
    background: Color.White_01,
    border: `1px solid ${Color.Grey_01}`,
    borderLeft: "none",
    borderRadius: 0,
  },
  icon: {
    color: Color.Black_01,
    fontSize: "0.5rem",
  },
});

const dropDownSelector = definePartsStyle({
  field: {
    ...TextStyles.b1,
    height: "45.52px",
    padding: "0.5rem",
    background: Color.White_01,
    border: `1px solid ${Color.Grey_01}`,
    borderRadius: 0,
  },
  icon: {
    color: Color.Black_01,
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
