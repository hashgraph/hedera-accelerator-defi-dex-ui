import { Icon } from "@chakra-ui/react";
import { Color } from "../../themes";

interface SwapIconProps<T> {
  options?: T;
}

export function SwapIcon<T>(props: SwapIconProps<T>) {
  return (
    <Icon width="15" height="22" viewBox="0 -5 15 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props.options}>
      <path
        d={`M3.88891 8.98888V1.52222M3.88891 1.52222L1.40002 4.01111M3.88891 1.52222L6.3778
                4.01111M10.1111 4.01111V11.4778M10.1111 11.4778L12.6 8.98888M10.1111 11.4778L7.62225
                8.98888`}
        fill={Color.White}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.336"
        stroke="#737373"
      />
    </Icon>
  );
}
