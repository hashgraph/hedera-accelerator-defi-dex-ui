import { createIcon } from "@chakra-ui/react";
import { Color } from "@shared/ui-kit/themes";

export const FileIcon = createIcon({
  displayName: "FileIcon",
  viewBox: "0 0 20 20",
  path: (
    <path
      d="M11.667 1.667H5a1.667 1.667 0 0 0-1.667 1.666v13.334A1.667 1.667 
      0 0 0 5 18.333h10a1.667 1.667 0 0 0 1.667-1.666v-10m-5-5 5 
      5m-5-5v5h5m-3.334 4.166H6.667m6.666 3.334H6.667M8.333 7.5H6.667"
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
