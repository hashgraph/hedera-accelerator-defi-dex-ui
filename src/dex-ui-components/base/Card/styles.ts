import { ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX NumberInput components
 * and sub-component parts.
 */
export const CardStyles: ComponentStyleConfig = {
  baseStyle: {
    height: "max-content",
    bg: "white",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
  },
  sizes: {},
  variants: {
    "proposal-card": {
      bg: "#FFFFFF",
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
      border: "0.25px solid #DBDEDF",
      borderRadius: "0px",
      width: "100%",
    },
    "file-uploader": {
      body: {
        bg: "#FFFFFF",
        width: "100%",
        textAlign: "center",
        justifyContent: "center",
        alignSelf: "center",
        border: "1px #00BAC6 dashed",
        height: "102Px",
        borderRadius: "8px",
        cursor: "pointer",
      },
    },
  },
  defaultProps: {},
};
