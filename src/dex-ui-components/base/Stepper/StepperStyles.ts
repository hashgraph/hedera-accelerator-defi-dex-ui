import { Color } from "../../themes";

export const StepperStyles = {
  ".MuiStepConnector-vertical": {
    height: "30px",
    paddingTop: "3px",
    verticalAlign: "middle",
  },
  ".MuiStepConnector-lineVertical": {
    height: "25px",
    borderLeftWidth: "3px",
    borderColor: Color.Grey_01,
    marginLeft: "-0.6px",
    borderStyle: "dashed",
    verticalAlign: "middle",
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
