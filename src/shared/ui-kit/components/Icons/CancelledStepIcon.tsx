import { createIcon } from "@chakra-ui/react";
import { Color } from "@shared/ui-kit/themes/colors";

export const CancelledStepIcon = createIcon({
  displayName: "CancelledStepIcon",
  viewBox: "0 0 26 26",
  path: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 23.2c6.185 0 11.2-5.015 11.2-11.2C23.2 5.814 18.185.8 12 .8 5.814.8.8 5.814.8 
      12c0 6.185 5.014 11.2 11.2 11.2ZM10.19 8.21a1.4 1.4 0 0 0-1.98 1.98L10.02 12l-1.81 
      1.81a1.4 1.4 0 1 0 1.98 1.98L12 13.98l1.81 1.81a1.4 1.4 0 0 0 1.98-1.98L13.98 12l1.81-1.81a1.4 
      1.4 0 0 0-1.98-1.98L12 10.02l-1.81-1.81Z"
    />
  ),
  defaultProps: {
    fill: Color.Destructive._500,
  },
});
