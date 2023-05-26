import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const ToastInfoIcon = createIcon({
  displayName: "ToastInfoIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <rect width="24" height="24" fill={Color.Blue._50} rx="12" />
      <path fill={Color.Blue._500} d="M13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM11 12a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0v-4Z" />
    </>
  ),
  defaultProps: {
    fill: "none",
  },
});
