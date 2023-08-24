import { Icon } from "@chakra-ui/react";

interface CircleMinusIconProps<T> {
  fill: string;
  fillOpacity?: string;
  options?: T;
}

export function CircleMinusIcon<T>(props: CircleMinusIconProps<T>) {
  const { fill, fillOpacity, options } = props;
  return (
    <Icon width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...options}>
      <path
        d={`M13 0.5C6.1 0.5 0.5 6.1 0.5 13C0.5 19.9 6.1 25.5 13 25.5C19.9 25.5 25.5 19.9 25.5 13C25.5 6.1 
            19.9 0.5 13 0.5ZM18 14.25H8C7.3125 14.25 6.75 13.6875 6.75 13C6.75 12.3125 7.3125 11.75 8 11.75H18C18.6875 
            11.75 19.25 12.3125 19.25 13C19.25 13.6875 18.6875 14.25 18 14.25Z`}
        fill={fill}
        fillOpacity={fillOpacity}
      />
    </Icon>
  );
}
