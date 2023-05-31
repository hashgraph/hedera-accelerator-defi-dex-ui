import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const PeopleIcon = createIcon({
  displayName: "PeopleIcon",
  viewBox: "0 0 20 18",
  path: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M14.167 16.5v-1.667a3.333 3.333 0 0 0-3.334-3.333H4.167a3.333 3.333 0 0 
      0-3.334 3.333V16.5m18.334 0v-1.667a3.334 3.334 0 0 0-2.5-3.225m-3.334-10a3.333 3.333 
      0 0 1 0 6.459m-2.5-3.234a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0Z"
    />
  ),
  defaultProps: {
    fill: "none",
    stroke: Color.Neutral._900,
  },
});
