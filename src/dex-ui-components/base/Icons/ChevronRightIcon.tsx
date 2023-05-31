import { createIcon } from "@chakra-ui/react";

export const ChevronRightIcon = createIcon({
  displayName: "ChevronRightIcon",
  viewBox: "0 0 7 12",
  path: (
    <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
  ),
  defaultProps: {
    fill: "none",
  },
});
