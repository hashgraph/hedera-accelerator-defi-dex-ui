import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { Color, DarkTheme } from "../../themes";

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
        borderBottom: `1px solid ${DarkTheme.border}`,
        gap: "0",
      },
      tab: {
        height: "fit-content",
        textStyle: "p medium medium",
        color: DarkTheme.textMuted,
        stroke: DarkTheme.textMuted,
        padding: "0.75rem 1.5rem",
        borderRadius: "0",
        marginBottom: "-1px",
        borderBottom: "2px solid transparent",
        transition: "all 0.2s ease-in-out",
        _selected: {
          color: DarkTheme.accentLight,
          bg: "transparent",
          borderBottom: `2px solid ${DarkTheme.accentLight}`,
          stroke: DarkTheme.accentLight,
        },
        _hover: {
          color: DarkTheme.text,
          bg: "transparent",
        },
      },
    },
    "dao-create-new": {
      tab: {
        color: Color.Neutral._500,
        stroke: Color.Neutral._500,
        borderRadius: "full",
        padding: "0.5rem 1rem",
        transition: "all 0.2s ease-in-out",
        _selected: {
          color: Color.White,
          bg: DarkTheme.accentGradient,
          borderRadius: "full",
          boxShadow: "0 4px 14px rgba(126, 34, 206, 0.3)",
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
