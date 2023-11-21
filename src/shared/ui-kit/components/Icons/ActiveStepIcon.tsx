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
      key="1"
    />,
  ],
});
