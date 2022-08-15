import { ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX button component.
 */
export const ButtonStyles: ComponentStyleConfig = {
  baseStyle: {
    height: "44px",
    padding: "16px",
    borderRadius: "8px",
  },
  variants: {
    primary: {
      bg: "black",
      color: "white",
    },
  },
  defaultProps: {
    variant: "primary",
  },
};
