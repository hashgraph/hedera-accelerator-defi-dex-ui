import { createIcon } from "@chakra-ui/react";

export const ChevronLeftIcon = createIcon({
  displayName: "ChevronLeftIcon",
  viewBox: "0 0 7 12",
  path: (
    <path d="M6 11L1 6L6 1" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
  ),
  defaultProps: {
    fill: "none",
  },
});
