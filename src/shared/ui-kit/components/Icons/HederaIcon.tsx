import { createIcon } from "@chakra-ui/react";
import { Color } from "@shared/ui-kit/themes";

export const HederaIcon = createIcon({
  displayName: "HederaIcon",
  viewBox: "0 0 40 40",
  path: (
    <>
      <path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" style={{ borderRadius: "100%" }} />
      <path
        d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z"
        fill={Color.White}
      />
    </>
  ),
});

/*

  <defs
     id="defs199" />
  <g
     id="layer1">

  </g>

 */
