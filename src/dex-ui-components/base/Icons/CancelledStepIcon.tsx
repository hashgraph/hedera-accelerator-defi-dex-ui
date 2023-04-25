import { Icon } from "@chakra-ui/react";

interface CancelledStepIconProps<T> {
  fill: string;
  fillOpacity?: string;
  options?: T;
}

export function CancelledStepIcon<T>(props: CancelledStepIconProps<T>) {
  const { options, fill, fillOpacity } = props;
  return (
    <Icon width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...options}>
      <path
        fill={fill}
        d={`M13 0.5C6.0875 0.5 0.5 6.0875 0.5 13C0.5 19.9125 6.0875 25.5 13 25.5C19.9125
        25.5 25.5 19.9125 25.5 13C25.5 6.0875 19.9125 0.5 13 0.5ZM18.375 18.375C17.8875
        18.8625 17.1 18.8625 16.6125 18.375L13 14.7625L9.3875 18.375C8.9 18.8625 8.1125
        18.8625 7.625 18.375C7.1375 17.8875 7.1375 17.1 7.625 16.6125L11.2375 13L7.625
        9.3875C7.1375 8.9 7.1375 8.1125 7.625 7.625C8.1125 7.1375 8.9 7.1375 9.3875 7.625L13
        11.2375L16.6125 7.625C17.1 7.1375 17.8875 7.1375 18.375 7.625C18.8625 8.1125
        18.8625 8.9 18.375 9.3875L14.7625 13L18.375 16.6125C18.85 17.0875 18.85 17.8875 18.375 18.375Z`}
        fillOpacity={fillOpacity}
      />
    </Icon>
  );
}
