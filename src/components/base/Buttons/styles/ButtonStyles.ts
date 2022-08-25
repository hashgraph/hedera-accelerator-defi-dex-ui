import { theme, ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX Button and IconButton components.
 */
export const ButtonStyles: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    primary: {
      bg: "black",
      color: "white",
      height: "44px",
      padding: "16px",
      borderRadius: "8px",
      fontWeight: "bold",
    },
    "switch-token-inputs": (props) => ({
      ...theme.components.Button.variants.outline(props),
      height: "42px",
      width: "42px",
      bg: "white",
      color: "black",
      borderColor: "black",
    }),
    settings: {
      height: "42px",
      width: "42px",
      bg: "white",
      color: "black",
    },
    "xs-text": {
      height: "fit-content",
      width: "fit-content",
      bg: "transparent",
      color: "#0180FF",
      textDecoration: "underline",
      fontWeight: "bold",
      fontSize: "xs",
      padding: "0.25rem",
    },
  },
  defaultProps: {
    variant: "primary",
  },
};
