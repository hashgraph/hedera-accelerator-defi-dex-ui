import { Color } from "../../themes";

export const StepperStyles = {
  ".MuiStepConnector-line": {
    borderColor: Color.Grey_01,
    borderStyle: "dashed",
    borderLeftWidth: "3px",
    paddingLeft: "10px",
  },
  ".MuiStepConnector-vertical": {
    paddingLeft: "3px",
    height: "50px",
    paddingBottom: "2px",
    paddingTop: "4px",
  },
  ".MuiStepConnector-lineVertical": {
    height: "40px",
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
