import { createIcon } from "@chakra-ui/react";

export const ChevronRightIcon = createIcon({
  displayName: "ChevronRightIcon",
  viewBox: "0 0 7 12",
  path: (
    <path d="M1 1L6 6L1 11" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
  ),
  defaultProps: {
    fill: "none",
  },
});
