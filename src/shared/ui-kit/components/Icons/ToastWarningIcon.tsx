import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const ToastWarningIcon = createIcon({
  displayName: "ToastWarningIcon",
  viewBox: "0 0 20 18",
  path: (
    <path
      d="M10 6.5v3.333m0 3.334h.008M8.575 2.217 1.517 14a1.667 1.667 
      0 0 0 1.425 2.5h14.116a1.665 1.665 0 0 0 1.425-2.5L11.425 2.217a1.666 1.666 0 0 0-2.85 0Z"
      strokeWidth="1.667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  defaultProps: {
    fill: "none",
    stroke: Color.Warning._500,
  },
});
