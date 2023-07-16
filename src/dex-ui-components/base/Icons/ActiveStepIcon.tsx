import { createIcon } from "@chakra-ui/react";
import { Color } from "../../themes";

export const ActiveStepIcon = createIcon({
  displayName: "ActiveStepIcon",
  viewBox: "0 0 26 26",
  path: [
    <path
      fill={Color.Blue._500}
      d="M10,5.5C10,7.9853,7.9853,10,5.5,10S1,7.9853,1,5.5S3.0147,1,5.5,1S10,3.0147,10,5.5z"
      transform="translate(7.5,7.2)"
    />,
    // <path
    //   fill="currentColor"
    //   d="M13 0.5C6.1 0.5 0.5 6.1 0.5 13C0.5 19.9 6.1 25.5 13 25.5C19.9 25.5 25.5 19.9
    // 25.5 13C25.5 6.1 19.9 0.5 13 0.5ZM13 23C7.475 23 3 18.525 3 13C3 7.475
    // 7.475 3 13 3C18.525 3 23 7.475 23 13C23 18.525 18.525 23 13 23Z"
    // />,
  ],
});
