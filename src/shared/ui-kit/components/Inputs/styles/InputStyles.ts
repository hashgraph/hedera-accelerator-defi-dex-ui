import { Color, TextStyles } from "../../../themes";
import { ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX Input components
 * and sub-component parts.
 */
export const InputStyles: ComponentStyleConfig = {
  baseStyle: {},
  sizes: {},
  variants: {
    "token-amount-input": {
      field: {
        ...TextStyles.h2,
        height: "fit-content",
        background: Color.White_01,
        padding: "12px 10px",
        border: `1px solid ${Color.Grey_01}`,
        borderRadius: 0,
      },
    },
    "input-v2": {
      field: {
        bg: Color.Grey_Blue._50,
        border: `1px solid ${Color.Neutral._300}`,
        borderRadius: "4px",
        ":placeholder": {
          ...TextStyles["p small regular"],
          color: Color.Neutral._400,
        },
      },
    },
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
    filter: {
      field: {
        bg: Color.White_02,
        border: `1px solid ${Color.Grey_02}`,
        minWidth: "300px",
        borderRadius: "0px",
        padding: "0 0.5rem",
        _placeholder: {
          color: Color.Black_01,
        },
      },
    },
  },
  defaultProps: {},
};
