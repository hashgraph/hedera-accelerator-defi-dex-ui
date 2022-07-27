import { ComponentStyleConfig } from "@chakra-ui/react";

export const ButtonStyles: ComponentStyleConfig = {
  baseStyle: {
    border: "2px",
    height: "48px",
    width: "100%",
    fontSize: "16px",
    fontWeight: "500",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  sizes: {},
  variants: {
    primary: {
      bg: "rgba(21, 61, 111, 0.44)",
      color: "rgb(80, 144, 234)",
    },
    secondary: {
      bg: "rgb(126, 132, 255)",
      color: "white",
    },
    swap: {
      border: "2px",
      padding: "0.75rem",
      bg: "rgba(21, 61, 111, 0.44)",
      color: "rgb(80, 144, 234)",
      fontSize: "16px",
      marginBottom: "1rem",
    },
  },
  defaultProps: {
    size: "lg",
    variant: "primary",
  },
};
