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
      bg: "black",
      color: "white",
    },
    secondary: {
      bg: "black",
      color: "white",
    },
    swap: {
      border: "2px",
      padding: "0.75rem",
      bg: "black",
      color: "white",
      fontSize: "16px",
      marginBottom: "1rem",
    },
  },
  defaultProps: {
    size: "lg",
    variant: "primary",
  },
};
