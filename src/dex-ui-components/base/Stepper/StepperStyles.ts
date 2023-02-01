import { Color } from "../../themes";

export const StepperStyles = {
  ".MuiStepConnector-line": {
    borderColor: Color.Grey_01,
    borderStyle: "dashed",
    borderLeftWidth: "3px",
    paddingLeft: "10px",
  },
  ".MuiStepConnector-vertical": {
    paddingLeft: "2.4px",
    height: "40px",
    paddingTop: "3px",
  },
  ".MuiStepConnector-lineVertical": {
    height: "34px",
  },
  ".MuiStepper-vertical": {
    background: Color.White_01,
  },
  ".MuiStepLabel-label": {
    fontWeight: "400",
    fontSize: "16px",
    lineHeight: "19px",
    color: Color.Text_Primary,
  },
};
