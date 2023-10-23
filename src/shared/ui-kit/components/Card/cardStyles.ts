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
    borderRadius: "4px",
    border: `1px solid ${Color.Neutral._200}`,
    padding: "1rem",
    width: "100%",
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
