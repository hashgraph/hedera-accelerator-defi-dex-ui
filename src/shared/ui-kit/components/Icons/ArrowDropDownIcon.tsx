import { Icon } from "@chakra-ui/react";
import { Color } from "../..";

interface ArrowDropDownIconProps<T> {
  options?: T;
}

export function ArrowDropDownIcon<T>(props: ArrowDropDownIconProps<T>) {
  return (
    <Icon viewBox="0 0 8 6" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d={`M0.710051 2.21L3.30005 4.8C3.69005 5.19 4.32005 5.19 4.71005 4.8L7.30005 2.21C7.93005 
        1.58 7.48005 0.5 6.59005 0.5H1.41005C0.520051 0.5 0.0800515 1.58 0.710051 2.21Z`}
        fill={Color.Black_01}
      />
    </Icon>
  );
}
