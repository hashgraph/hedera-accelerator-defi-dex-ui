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
        bg: Color.White,
        padding: "0.25rem",
        borderRadius: "10px",
        boxShadow: Color.Shadow.Soft,
      },
      tab: {
        height: "fit-content",
        textStyle: "p medium medium",
        color: Color.Neutral._500,
        stroke: Color.Neutral._400,
        padding: "0.625rem 1.25rem",
        borderRadius: "8px",
        transition: "all 0.2s ease-in-out",
        _selected: {
          color: Color.Neutral._900,
          bg: Color.Primary._50,
          borderBottom: "none",
          stroke: Color.Primary._500,
          boxShadow: Color.Shadow.Soft,
        },
        _hover: {
          color: Color.Neutral._700,
          bg: Color.Neutral._50,
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
