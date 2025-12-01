import { theme, ComponentStyleConfig } from "@chakra-ui/react";
import { Color, TextStyles } from "../../themes";

const primary = {
  ...TextStyles["p small semibold"],
  bg: Color.Primary._500,
  color: Color.White,
  padding: "0 24px",
  borderRadius: "8px",
  boxShadow: "none",
  transition: "all 0.2s ease-in-out",
  ":hover": {
    bg: Color.Primary._600,
    boxShadow: "none",
    transform: "translateY(-1px)",
  },
  ":focus": {
    bg: Color.Primary._500,
    boxShadow: "none",
  },
  ":active": {
    transform: "translateY(0)",
    boxShadow: "none",
  },
  ":disabled": {
    bg: Color.Neutral._200,
    color: Color.Neutral._500,
    boxShadow: "none",
    transform: "none",
  },
  ":hover:disabled": {
    bg: Color.Neutral._200,
    color: Color.Neutral._500,
    transform: "none",
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
      color: Color.Grey_Blue._700,
      padding: "0 24px",
      borderRadius: "8px",
      border: `1px solid ${Color.Grey_Blue._200}`,
      boxShadow: "none",
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: Color.Grey_Blue._200,
        borderColor: Color.Grey_Blue._300,
        boxShadow: "none",
        transform: "translateY(-1px)",
      },
      ":focus": {
        bg: Color.Grey_Blue._100,
        boxShadow: "none",
      },
      ":active": {
        transform: "translateY(0)",
      },
      ":disabled": {
        bg: Color.Neutral._100,
        color: Color.Neutral._400,
        borderColor: Color.Neutral._200,
        boxShadow: "none",
        transform: "none",
      },
      ":hover:disabled": {
        bg: Color.Neutral._100,
        transform: "none",
      },
    },
    ternary: {
      bg: Color.Black_01,
      border: `1px solid ${Color.Neutral._700}`,
      borderRadius: "8px",
      padding: "0rem 2rem",
      ...TextStyles.h4,
      color: Color.White_01,
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: Color.Neutral._800,
        borderColor: Color.Neutral._600,
      },
    },
    cancel: {},
    purple: {
      ...TextStyles["p small semibold"],
      bg: Color.Private.Accent,
      color: Color.White,
      padding: "0 24px",
      borderRadius: "8px",
      boxShadow: "none",
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: "#7C3AED",
        boxShadow: "none",
        transform: "translateY(-1px)",
      },
      ":focus": {
        bg: Color.Private.Accent,
        boxShadow: "none",
      },
      ":active": {
        transform: "translateY(0)",
        boxShadow: "none",
      },
      ":disabled": {
        bg: Color.Neutral._200,
        color: Color.Neutral._500,
        boxShadow: "none",
        transform: "none",
      },
      ":hover:disabled": {
        bg: Color.Neutral._200,
        color: Color.Neutral._500,
        transform: "none",
      },
    },
    "new-proposal": {
      ...primary,
      minWidth: "250px",
    },
    "switch-token-inputs": (props) => ({
      ...theme.components.Button.variants?.outline(props),
      height: "48px",
      width: "48px",
      bg: Color.White_01,
      boxShadow: "none",
    }),
    settings: {
      height: "36px",
      width: "fit-content",
      padding: "0.5rem 1rem",
      bg: Color.White,
      border: `1px solid ${Color.Neutral._200}`,
      borderRadius: "8px",
      boxShadow: "none",
      transition: "all 0.2s ease-in-out",
      ":hover": {
        bg: Color.Neutral._50,
        borderColor: Color.Neutral._300,
        boxShadow: "none",
      },
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
        border: `1px solid ${Color.Primary._300}`,
        boxShadow: "none",
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
