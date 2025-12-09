import { StepsTheme as Steps } from "chakra-ui-steps";
import { Color } from "../../themes";

export const StepsV2Theme = {
  ...Steps,
  baseStyle: (props: any) => {
    return {
      ...Steps.baseStyle(props),
      step: {
        ":after": {
          position: "relative",
          top: "-14px",
          backgroundColor: `${Color.Neutral._200} !important`,
        },
        "&[data-highlighted]": {
          ":after": {
            backgroundColor: `${Color.Primary._500} !important`,
          },
        },
      },
      stepContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      stepIconContainer: {
        ...Steps.baseStyle(props).stepIconContainer,
        backgroundColor: "transparent !important",
        border: "none !important",
        "&[aria-current=step]": {
          height: "24px !important",
          width: "24px !important",
          background: `transparent !important`,
          border: `1.5px solid ${Color.Primary._500} !important`,
          boxShadow: `0px 0px 0px 2.66667px ${Color.Primary._100}`,
        },
        "&[data-highlighted]": {
          height: "24px !important",
          width: "24px !important",
          backgroundColor: `${Color.White} !important`,
          borderColor: `${Color.Primary._500} !important`,
        },
        "&:not([data-highlighted])": {
          height: "24px !important",
          width: "24px !important",
        },
        svg: {
          height: "24px !important",
        },
      },
      labelContainer: {
        ...Steps.baseStyle(props).labelContainer,
        marginTop: "0.5rem",
        marginInlineStart: "0 !important",
        "-webkitMarginStart": "0 !important",
        "&[aria-current=step] > span": {
          color: Color.Primary._500,
        },
      },
      label: {},
    };
  },
};
