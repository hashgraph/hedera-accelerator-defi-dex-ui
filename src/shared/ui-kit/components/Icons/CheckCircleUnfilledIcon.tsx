import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const CheckCircleUnfilledIcon = createIcon({
  displayName: "CheckCircleUnfilledIcon",
  viewBox: "0 0 16 16",
  path: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.67"
      d="m5.667 8 1.555 1.556 3.111-3.112M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
    />
  ),
  defaultProps: {
    fill: "none",
    stroke: Color.Neutral._500,
  },
});
