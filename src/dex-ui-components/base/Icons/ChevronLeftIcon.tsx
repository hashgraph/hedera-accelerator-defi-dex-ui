import { createIcon } from "@chakra-ui/react";

export const ChevronLeftIcon = createIcon({
  displayName: "ChevronLeftIcon",
  viewBox: "0 0 7 12",
  path: (
    <path d="M6 11L1 6L6 1" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
  ),
  defaultProps: {
    fill: "none",
  },
});
