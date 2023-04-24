import { Icon } from "@chakra-ui/react";
import { Color } from "../../themes";

interface LightningBoltIconProps<T> {
  options?: T;
}

export function LightningBoltIcon<T>(props: LightningBoltIconProps<T>) {
  return (
    <Icon width="15" height="22" viewBox="0 -5 15 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props.options}>
      <path
        d={`M8.62246 7.25558V2.90002L3.02246 9.74447H7.37802L7.37802
                14.1L12.978 7.25558L8.62246 7.25558Z`}
        fill={Color.White}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#737373"
        strokeWidth="1.336"
      />
    </Icon>
  );
}
