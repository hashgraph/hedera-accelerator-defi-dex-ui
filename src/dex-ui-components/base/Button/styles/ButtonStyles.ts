import { theme, ComponentStyleConfig } from "@chakra-ui/react";
import { TextStyles } from "../..";
import { Color } from "../../../themes";

const primary = {
  bg: Color.Teal_01,
  color: "white",
  height: "44px",
  padding: "16px",
  borderRadius: "2px",
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
  ":disabled": {
    bg: Color.Grey_01,
    opacity: 1,
  },
  ":hover:disabled": {
    bg: Color.Grey_01,
  },
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
      border: `0.25px solid ${Color.Grey_01}`,
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
      borderRadius: "2px",
    },
    ternary: {
      bg: Color.Black_01,
      border: `0.25px solid ${Color.White_01}`,
      borderRadius: "1px",
      padding: "0rem 2rem",
      ...TextStyles.h4,
      color: Color.White_01,
    },
    cancel: {},
    "new-proposal": {
      ...primary,
      minWidth: "250px",
    },
    "switch-token-inputs": (props) => ({
      ...theme.components.Button.variants?.outline(props),
      height: "48px",
      width: "48px",
      bg: Color.White_01,
      boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.15)",
    }),
    settings: {
      height: "32px",
      width: "fit-content",
      padding: "0.5rem 0.75rem",
      bg: Color.White_01,
      border: `1px solid ${Color.Grey_01}`,
      borderRadius: "8px",
    },
    link: {
      ...TextStyles.link,
      height: "fit-content",
      width: "fit-content",
      bg: "transparent",
      padding: 0,
      margin: "0 -0.25rem",
    },
  },
  defaultProps: {
    variant: "primary",
  },
};
