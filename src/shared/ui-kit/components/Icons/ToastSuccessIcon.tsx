import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const ToastSuccessIcon = createIcon({
  displayName: "ToastSuccessIcon",
  viewBox: "0 0 24 24",
  path: (
    <>
      <rect width="24" height="24" rx="12" fill={Color.Success._50} />
      <path
        d="m16.727 9-6 6L8 12.273"
        stroke={Color.Success._700}
        strokeWidth="1.09091"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  defaultProps: {
    fill: "none",
    color: Color.Success._500,
  },
});
