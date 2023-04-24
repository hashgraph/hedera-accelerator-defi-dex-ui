import { Icon } from "@chakra-ui/react";
import { Color } from "../../themes";

interface TooltipIconProps<T> {
  options?: T;
  fill?: string;
}

export function TooltipIcon<T>(props: TooltipIconProps<T>) {
  return (
    <Icon width="11" height="11" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
      <path
        d={`M5.50016 0.0833435C2.51016 0.0833435 0.0834961 2.51001 0.0834961 5.50001C0.0834961 8.49001 
        2.51016 10.9167 5.50016 10.9167C8.49016 10.9167 10.9168 8.49001 10.9168 5.50001C10.9168 2.51001 
        8.49016 0.0833435 5.50016 0.0833435ZM5.50016 8.20834C5.20225 8.20834 4.9585 7.96459 4.9585 
        7.66668V5.50001C4.9585 5.20209 5.20225 4.95834 5.50016 4.95834C5.79808 4.95834 6.04183 5.20209 
        6.04183 5.50001V7.66668C6.04183 7.96459 5.79808 8.20834 5.50016 8.20834ZM6.04183 
        3.87501H4.9585V2.79168H6.04183V3.87501Z`}
        fill={props.fill ?? Color.Black_01}
      />
    </Icon>
  );
}
