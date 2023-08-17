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
      padding: "8px",
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
    borderRadius: "0px",
    backgroundColor: Color.Teal_02,
  },
  ".react-datepicker__day.react-datepicker__day--selected": {
    border: "none",
    borderRadius: "0px",
  },
  ".react-datepicker__day--in-range": {
    background: Color.Teal_02,
  },
  ".react-datepicker__day.react-datepicker__day": {
    fontSize: "16px",
    lineHeight: "19.78px",
    fontWeight: "600",
    fontColor: "#000000",
    border: "none",
    borderRadius: "0px",
  },
  ".react-datepicker__header": {
    background: "white",
    border: "none",
    fontSize: "16px",
    lineHeight: "19.78px",
    fontWeight: "600",
    fontColor: "#000000",
  },
  ".react-datepicker__day--in-selecting-range": {
    background: Color.Teal_02,
  },
  ".react-datepicker__day--selected:hover": {
    background: Color.Teal_02,
  },
  ".react-datepicker__day--in-selecting-range:hover": {
    background: Color.Teal_02,
  },
  ".react-datepicker__day--in-range:hover": {
    background: Color.Teal_02,
  },
  ".react-datepicker__year-dropdown": {
    background: "white",
  },
  ".react-datepicker__navigation--years-option": {
    background: "white",
    border: "none",
    fontSize: "16px",
    lineHeight: "19.78px",
    fontWeight: "600",
    fontColor: "#000000",
  },
  ".react-datepicker__year-text--in-range:hover": {
    background: "white",
    border: "none",
    fontSize: "16px",
    lineHeight: "19.78px",
    fontWeight: "600",
    fontColor: "#000000",
  },
  ".react-datepicker__navigation-icon": {
    height: "10px",
  },
  ".react-datepicker__year-read-view--down-arrow": {
    top: "3px",
  },
  ".react-datepicker__year-read-view": {
    left: "10px",
  },
  ".react-datepicker__month-read-view": {
    right: "10px",
  },
  ".react-datepicker__month-read-view--down-arrow": {
    top: "3px",
  },
  ".react-datepicker__month-option": {
    background: "white",
    border: "none",
    fontSize: "16px",
    lineHeight: "19.78px",
    fontWeight: "600",
    fontColor: "#000000",
  },
  ".react-datepicker__current-month": {
    visibility: "hidden",
    height: "0px",
  },
  ".react-datepicker__navigation.react-datepicker__navigation--previous": {
    top: "-1px",
  },
  ".react-datepicker__navigation.react-datepicker__navigation--next": {
    top: "-1px",
  },
};
