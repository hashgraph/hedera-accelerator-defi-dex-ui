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
  tab: {
    height: "fit-content",
    padding: "0",
    marginRight: "1.5rem",
    color: Color.Grey_02,
    _selected: {
      color: Color.Black_01,
      borderBottom: `4px solid ${Color.Black_01}`,
    },
  },
});

/**
 * Base Chakra UI styles and variants for the Hedera DEX Tab components
 * and sub-component parts.
 */
export const TabsStyles = defineMultiStyleConfig({
  baseStyle,
  sizes: {},
  variants: {},
  defaultProps: {},
});
