import { ComponentStyleConfig } from "@chakra-ui/react";
import { Color, TextStyles } from "../../themes";

/**
 * Base Chakra UI styles and variants for the Hedera DEX Button and IconButton components.
 */
export const TextAreaStyles: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    "input-text-area": {
      bg: Color.Grey_Blue._50,
      border: `1px solid ${Color.Neutral._300}`,
      borderRadius: "4px",
      ":placeholder": {
        ...TextStyles["p small regular"],
        color: Color.Neutral._400,
      },
    },
    defaultProps: {},
  },
};
