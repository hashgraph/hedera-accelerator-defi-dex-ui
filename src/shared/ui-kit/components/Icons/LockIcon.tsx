import { Icon } from "@chakra-ui/react";
import { Color } from "../..";

interface LockIconProps<T> {
  options?: T;
}

export function LockIcon<T>(props: LockIconProps<T>) {
  return (
    <Icon width="15" height="22" viewBox="0 -5 15 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props.options}>
      <path
        d="M6.00024 8.36669V9.61114M2.26691 12.1H9.73357C10.4209 12.1 10.978 11.5429 10.978
                10.8556V7.12225C10.978 6.43496 10.4209 5.8778 9.73357 5.8778H2.26691C1.57962 5.8778
                1.02246 6.43496 1.02246 7.12225V10.8556C1.02246 11.5429 1.57962 12.1 2.26691
                12.1ZM8.48913 5.8778V3.38891C8.48913 2.01434 7.37481 0.900024 6.00024 0.900024C4.62566
                0.900024 3.51135 2.01434 3.51135 3.38891V5.8778H8.48913Z"
        fill={Color.White}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.336"
        stroke="#737373"
      />
    </Icon>
  );
}
