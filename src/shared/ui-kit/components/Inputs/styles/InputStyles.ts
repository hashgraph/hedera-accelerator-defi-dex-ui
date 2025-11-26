import { Color, TextStyles } from "../../../themes";
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
        background: Color.White,
        padding: "14px 12px",
        border: `1px solid ${Color.Neutral._200}`,
        borderRadius: "10px",
        transition: "all 0.2s ease-in-out",
        _hover: {
          borderColor: Color.Primary._300,
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(0, 186, 198, 0.15)`,
        },
      },
    },
    "input-v2": {
      field: {
        bg: Color.White,
        border: `1px solid ${Color.Neutral._200}`,
        borderRadius: "8px",
        transition: "all 0.2s ease-in-out",
        ":placeholder": {
          ...TextStyles["p small regular"],
          color: Color.Neutral._400,
        },
        _hover: {
          borderColor: Color.Neutral._300,
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(0, 186, 198, 0.15)`,
        },
      },
    },
    "form-input": {
      field: {
        bg: Color.White,
        border: `1px solid ${Color.Neutral._200}`,
        boxShadow: Color.Shadow.Soft,
        borderRadius: "10px",
        padding: "16px",
        height: "52px",
        transition: "all 0.2s ease-in-out",
        "::placeholder": {
          fontSize: "16px",
          lineHeight: "19px",
          fontWeight: "400",
          color: Color.Neutral._400,
        },
        _hover: {
          borderColor: Color.Neutral._300,
          boxShadow: Color.Shadow.Medium,
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(0, 186, 198, 0.15)`,
        },
        _invalid: {
          borderColor: Color.Destructive._500,
          boxShadow: `0 0 0 3px rgba(238, 43, 0, 0.15)`,
        },
      },
    },
    filter: {
      field: {
        bg: Color.White,
        border: `1px solid ${Color.Neutral._200}`,
        minWidth: "280px",
        borderRadius: "8px",
        padding: "0.5rem 0.75rem",
        transition: "all 0.2s ease-in-out",
        _placeholder: {
          color: Color.Neutral._400,
        },
        _hover: {
          borderColor: Color.Neutral._300,
        },
        _focus: {
          borderColor: Color.Primary._500,
          boxShadow: `0 0 0 3px rgba(0, 186, 198, 0.15)`,
        },
      },
    },
  },
  defaultProps: {},
};
