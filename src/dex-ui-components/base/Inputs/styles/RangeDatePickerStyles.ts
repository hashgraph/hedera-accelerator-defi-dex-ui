import { Color } from "../../../themes";

export const RangeDatePickerStyles = {
  ".react-datepicker__input-container": {
    display: "inline-block",
    width: "300px",
    height: "40px",
    color: "yellow",
    paddingLeft: "5px",
    input: {
      outline: "none",
      borderRadius: "0px",
      border: `1px solid ${Color.Grey_02}`,
      lineHeight: "19px",
      fontWeight: "400",
      padding: "5px",
      color: Color.Black_01,
      "::placeholder": {
        fontSize: "16px",
        lineHeight: "19px",
        fontWeight: "400",
        color: Color.Black_01,
      },
    },
  },
  ".react-datepicker__day.react-datepicker__day--keyboard-selected": {
    border: "none",
    borderRadius: "7px",
    backgroundColor: Color.Teal_02,
  },
};
