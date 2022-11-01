import { ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX NumberInput components
 * and sub-component parts.
 */
export const CardStyles: ComponentStyleConfig = {
  baseStyle: {
    height: "max-content",
  },
  sizes: {},
  variants: {
    "proposal-card": {
      bg: "white",
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
      borderRadius: "8px",
      width: "100%",
    },
  },
  defaultProps: {},
};
