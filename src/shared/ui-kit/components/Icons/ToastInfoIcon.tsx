import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const ToastInfoIcon = createIcon({
  displayName: "ToastInfoIcon",
  viewBox: "0 0 20 20",
  path: (
    <path
      d="M10 6.667V10m0 3.333h.008M18.333 10a8.333 8.333 0 1 1-16.666 0 8.333 8.333 0 0 1 16.666 0Z"
      strokeWidth="1.667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  defaultProps: {
    fill: "none",
    stroke: Color.Primary._500,
  },
});
