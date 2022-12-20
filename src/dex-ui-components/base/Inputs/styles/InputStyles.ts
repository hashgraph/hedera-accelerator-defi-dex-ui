import { ComponentStyleConfig } from "@chakra-ui/react";
import { Color } from "../../../themes";

/**
 * Base Chakra UI styles and variants for the Hedera DEX Input components
 * and sub-component parts.
 */
export const InputStyles: ComponentStyleConfig = {
  baseStyle: {},
  sizes: {},
  variants: {
    "form-input": {
      field: {
        bg: "#FFFFFF",
        border: "1px solid #F2F2F4",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        padding: "16px",
        height: "52px",
        "::placeholder": {
          fontSize: "16px",
          lineHeight: "19px",
          fontWeight: "400",
          color: "#C4C4C4",
        },
        _invalid: {
          borderColor: Color.Red_01,
          boxShadow: `0 0 0 1px ${Color.Red_01}`,
        },
      },
    },
  },
  defaultProps: {},
};
