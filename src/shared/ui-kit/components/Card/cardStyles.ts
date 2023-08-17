import { ComponentStyleConfig } from "@chakra-ui/react";
import { Color } from "../../themes";
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
    "file-uploader": {
      body: {
        bg: "#FFFFFF",
        width: "100%",
        textAlign: "center",
        justifyContent: "center",
        alignSelf: "center",
        border: "1px #00BAC6 dashed",
        height: "102px",
        borderRadius: "8px",
        cursor: "pointer",
      },
    },
  },
  defaultProps: {},
};
