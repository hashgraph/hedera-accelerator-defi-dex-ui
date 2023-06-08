import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const SuccessCheckIcon = createIcon({
  displayName: "SuccessCheckIcon",
  viewBox: "0 0 20 20",
  path: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M18.334 9.233V10a8.334 8.334 0 1 1-4.942-7.617m4.942.95L10 11.675l-2.5-2.5"
    />
  ),
  defaultProps: {
    fill: "none",
    stroke: Color.Success._500,
  },
});
