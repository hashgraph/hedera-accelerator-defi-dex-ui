import { theme, ComponentStyleConfig } from "@chakra-ui/react";

/**
 * Base Chakra UI styles and variants for the Hedera DEX NumberInput components
 * and sub-component parts.
 */
export const NumberInputStyles: ComponentStyleConfig = {
  baseStyle: {},
  sizes: {},
  variants: {
    "token-amount-input": (props) => ({
      ...theme.components.NumberInput.variants?.outline(props),
      field: {
        backgroundColor: "white",
        borderBottom: "1px solid #E7E9EB",
        borderRight: "1px solid #E7E9EB",
        borderRadius: "5px 0 0 5px",
      },
    }),
  },
  defaultProps: {},
};
