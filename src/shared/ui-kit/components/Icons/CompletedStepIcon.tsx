import { createIcon } from "@chakra-ui/react";
import { Color } from "../..";

export const CompletedStepIcon = createIcon({
  displayName: "ActiveStepIcon",
  viewBox: "0 0 26 26",
  path: [
    <path
      d={`M13 0.5C6.1 0.5 0.5 6.1 0.5 13C0.5 19.9 6.1 25.5 13 
      25.5C19.9 25.5 25.5 19.9 25.5
    13C25.5 6.1 19.9 0.5 13 0.5ZM9.6125 18.3625L5.125 13.875C4.6375 
    13.3875 4.6375 12.6 5.125
    12.1125C5.6125 11.625 6.4 11.625 6.8875 12.1125L10.5 15.7125L19.1 
    7.1125C19.5875 6.625 20.375 6.625
    20.8625 7.1125C21.35 7.6 21.35 8.3875 20.8625 8.875L11.375 18.3625C10.9 
    18.85 10.1 18.85 9.6125 18.3625Z`}
      fill={Color.Blue._500}
      key="1"
    />,
  ],
});
