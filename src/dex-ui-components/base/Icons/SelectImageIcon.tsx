import { Icon } from "@chakra-ui/react";
import { Color } from "../..";

interface SelectImageIconProps<T> {
  options?: T;
  fill?: string;
}

export function SelectImageIcon<T>(props: SelectImageIconProps<T>) {
  const { fill = Color.Grey_Blue._50, options } = props;
  return (
    <Icon width="58" height="58" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...options}>
      <rect width="64" height="64" fill="#F7F9FA" rx="32" />
      <path
        d="m20.8 37.6 6.42-6.42a2.8 2.8 0 0 1 3.96 0l6.42 6.42m-2.8-2.8 2.22-2.22a2.8 2.8 0 
                0 1 3.96 0l2.22 2.22m-8.4-8.4h.014M23.6 43.2h16.8a2.8 2.8 0 0 0 2.8-2.8V23.6a2.8 2.8 
                0 0 0-2.8-2.8H23.6a2.8 2.8 0 0 0-2.8 2.8v16.8a2.8 2.8 0 0 0 2.8 2.8Z"
        fill={fill}
        rx="32"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        stroke="#839CA5"
      />
    </Icon>
  );
}
