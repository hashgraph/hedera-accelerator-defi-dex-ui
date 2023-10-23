import { Box } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RangeDatePickerStyles } from "./styles";

interface RangeDatePickerProps {
  id?: string;
  placeholder?: string;
  startDate: Date | null;
  endDate: Date | null;
  onSelection: (dates: any) => void;
}

const RangeDatePicker = (props: RangeDatePickerProps) => {
  const { id, placeholder, startDate, endDate, onSelection } = props;
  return (
    <Box sx={RangeDatePickerStyles}>
      <DatePicker
        selectsRange
        id={id}
        selected={startDate}
        startDate={startDate}
        endDate={endDate}
        className="react-datepicker__input-container"
        placeholderText={placeholder}
        showYearDropdown
        showMonthDropdown
        onChange={onSelection}
      />
    </Box>
  );
};

export { RangeDatePicker };
