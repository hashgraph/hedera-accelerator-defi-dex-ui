import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { Color } from "../../themes";

/**
 * TODO: Investigate why the chakra theming API is not applying these styles.
 */
const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys);

const baseStyle = definePartsStyle({
  tabList: {
    borderBottom: "0",
    gap: "0.5rem",
  },
  tab: {
    transition: "all 0.2s ease-in-out",
  },
});

/**
 * Base Chakra UI styles and variants for the Hedera DEX Tab components
 * and sub-component parts.
 */
export const TabsStyles = defineMultiStyleConfig({
  baseStyle,
  sizes: {},
  variants: {
    "dao-dashboard-tab": {
      tabList: {
        bg: "transparent",
        padding: "0",
        borderBottom: `2px solid ${Color.Neutral._200}`,
        gap: "0",
      },
      tab: {
        height: "fit-content",
        textStyle: "p medium medium",
        color: Color.Neutral._500,
        stroke: Color.Neutral._400,
        padding: "0.75rem 1.5rem",
        borderRadius: "0",
        marginBottom: "-2px",
        borderBottom: "2px solid transparent",
        transition: "all 0.2s ease-in-out",
        _selected: {
          color: Color.Primary._600,
          bg: "transparent",
          borderBottom: `2px solid ${Color.Primary._500}`,
          stroke: Color.Primary._500,
        },
        _hover: {
          color: Color.Primary._500,
          bg: "transparent",
        },
      },
    },
    "dao-create-new": {
      tab: {
        color: Color.Neutral._500,
        stroke: Color.Neutral._400,
        borderRadius: "8px",
        padding: "0.5rem 1rem",
        transition: "all 0.2s ease-in-out",
        _selected: {
          color: Color.White,
          bg: Color.Primary._500,
          borderRadius: "8px",
          boxShadow: Color.Shadow.Primary,
        },
        _hover: {
          color: Color.Neutral._700,
        },
      },
    },
    defaultProps: {},
  },
  defaultProps: {},
});
