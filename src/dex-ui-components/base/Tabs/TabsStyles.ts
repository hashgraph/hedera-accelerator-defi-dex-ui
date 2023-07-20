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
  },
  tab: {},
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
      tab: {
        height: "fit-content",
        textStyle: "p medium medium",
        color: Color.Neutral._400,
        stroke: Color.Neutral._400,
        _selected: {
          color: Color.Neutral._900,
          borderBottom: `4px solid ${Color.Primary._500}`,
          stroke: Color.Primary._500,
        },
        _hover: {
          color: Color.Neutral._900,
        },
      },
    },
    "dao-create-new": {
      tab: {
        color: Color.Neutral._500,
        stroke: Color.Neutral._400,
        _selected: {
          color: Color.White_02,
          bg: Color.Grey_Blue._500,
          borderRadius: "0.25rem",
        },
      },
    },
    defaultProps: {},
  },
  defaultProps: {},
});
