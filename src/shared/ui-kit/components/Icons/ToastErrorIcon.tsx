import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const ToastErrorIcon = createIcon({
  displayName: "ToastErrorIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <rect width="24" height="24" fill={Color.Destructive._50} rx="12" />
      <path stroke={Color.Destructive._500} strokeLinecap="round" strokeLinejoin="round" d="m16 8-8 8m0-8 8 8" />
    </>
  ),
  defaultProps: {
    fill: "none",
    color: Color.Destructive._500,
  },
});
