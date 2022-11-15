import { theme, ComponentStyleConfig } from "@chakra-ui/react";
import { Color } from "../../../themes";

const primary = {
  bg: Color.Teal_01,
  color: "white",
  height: "44px",
  padding: "16px",
  borderRadius: "2px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
};

/**
 * Base Chakra UI styles and variants for the Hedera DEX Button and IconButton components.
 */
export const ButtonStyles: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    primary: {
      ...primary,
    },
    secondary: {
      bg: Color.White_01,
      height: "44px",
      border: `0.25pxpx solid ${Color.Grey_01}`,
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
      borderRadius: "2px",
    },
    cancel: {},
    "new-proposal": {
      ...primary,
      minWidth: "250px",
    },
    "switch-token-inputs": (props) => ({
      ...theme.components.Button.variants?.outline(props),
      height: "42px",
      width: "42px",
      bg: "white",
      color: "black",
      borderColor: "black",
      marginTop: "0.5rem",
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
      textDecoration: "none",
      fontWeight: "bold",
      fontSize: "12px",
      padding: "0",
    },
  },
  defaultProps: {
    variant: "primary",
  },
};
