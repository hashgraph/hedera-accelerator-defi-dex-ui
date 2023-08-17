import { theme, ComponentStyleConfig } from "@chakra-ui/react";
import { Color, TextStyles } from "../../themes";

const primary = {
  ...TextStyles["p small semibold"],
  bg: Color.Primary._500,
  color: Color.White,
  padding: "0 24px",
  borderRadius: "4px",
  ":hover": {
    bg: Color.Primary._600,
  },
  ":focus": {
    bg: Color.Primary._500,
  },
  ":disabled": {
    bg: Color.Neutral._200,
    color: Color.Neutral._600,
  },
  ":hover:disabled": {
    bg: Color.Neutral._400,
    color: Color.Neutral._800,
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
      ...TextStyles["p small semibold"],
      bg: Color.Grey_Blue._100,
      color: Color.Grey_Blue._600,
      padding: "0 24px",
      borderRadius: "4px",
      ":hover": {
        bg: Color.Grey_Blue._200,
      },
      ":focus": {
        bg: Color.Grey_Blue._100,
      },
      ":disabled": {
        bg: Color.Neutral._200,
        color: Color.Neutral._600,
      },
      ":hover:disabled": {
        bg: Color.Neutral._400,
        color: Color.Neutral._800,
      },
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
    "token-selector": {
      padding: "0 1rem",
      minWidth: "120px",
      bg: "transparent",
      border: "1px solid transparent",
      color: Color.Black,
      _hover: {
        bg: "transparent",
        border: `1px solid ${Color.Blue._300}`,
        boxShadow: `0px 0px 0px 4px ${Color.Blue._100}`,
      },
      _focus: {
        bg: "transparent",
      },
    },
  },
  defaultProps: {
    variant: "primary",
  },
};
