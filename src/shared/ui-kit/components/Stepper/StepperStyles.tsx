import { Color } from "../../themes";

const baseStyle = {
  indicator: {
    backgroundColor: Color.White,
    width: "1.5rem",
    height: "1.5rem",
    "&[data-status=complete]": {
      backgroundColor: Color.White,
    },
    "&[data-status=incomplete]": {
      backgroundColor: Color.White,
    },
    "&[data-status=active]": {
      backgroundColor: Color.White,
    },
  },
};

/**
 * Base Chakra UI styles and variants for the Stepper component
 * and sub-component parts.
 */
export const StepperStyles = {
  baseStyle,
};
