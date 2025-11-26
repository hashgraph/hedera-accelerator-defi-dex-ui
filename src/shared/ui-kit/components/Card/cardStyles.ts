import { ComponentStyleConfig } from "@chakra-ui/react";
import { Color } from "../../themes";

const defaultFileUploaderStyles = {
  body: {
    bg: Color.White,
    width: "100%",
    textAlign: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: "102px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

/**
 * Base Chakra UI styles and variants for the Hedera DEX NumberInput components
 * and sub-component parts.
 */
export const CardStyles: ComponentStyleConfig = {
  baseStyle: {
    height: "max-content",
    bg: Color.White,
    borderRadius: "12px",
    border: `1px solid ${Color.Neutral._100}`,
    padding: { base: "0.75rem", sm: "1rem", md: "1.25rem" },
    width: "100%",
    boxShadow: Color.Shadow.Card,
    transition: "all 0.25s ease-in-out",
    _hover: {
      boxShadow: Color.Shadow.CardHover,
      borderColor: Color.Neutral._200,
      transform: "translateY(-2px)",
    },
  },
  sizes: {},
  variants: {
    "file-uploader-empty": {
      body: {
        ...defaultFileUploaderStyles.body,
        border: `1px ${Color.Primary._300} dashed`,
        p: {
          color: Color.Primary._500,
        },
      },
    },
    "file-uploader-error": {
      body: {
        ...defaultFileUploaderStyles.body,
        border: `1px ${Color.Destructive._500} dashed`,
        p: {
          color: Color.Destructive._700,
        },
      },
    },
    "file-uploader-success": {
      body: {
        ...defaultFileUploaderStyles.body,
        border: `1px ${Color.Success._500} dashed`,
        p: {
          color: Color.Success._700,
        },
      },
    },
  },
  defaultProps: {},
};
