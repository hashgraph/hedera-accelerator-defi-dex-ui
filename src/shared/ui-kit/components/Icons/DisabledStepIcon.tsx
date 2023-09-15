import { createIcon } from "@chakra-ui/react";
import { Color } from "../..";

export const DisabledStepIcon = createIcon({
  displayName: "DisabledStepIcon",
  viewBox: "0 0 26 26",
  path: (
    <path
      fill={Color.Grey_01}
      d={`M13 0.5C6.1 0.5 0.5 6.1 0.5 13C0.5 19.9 6.1 25.5 13 25.5C19.9 25.5
        25.5 19.9 25.5 13C25.5 6.1 19.9 0.5 13 0.5ZM13 23C7.475 23 3 18.525 3
        13C3 7.475 7.475 3 13 3C18.525 3 23 7.475 23 13C23 18.525 18.525 23 13 23Z`}
    />
  ),
});
