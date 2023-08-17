import { Icon } from "@chakra-ui/react";

interface TrendingUpProps<T> {
  fill: string;
  options?: T;
}

export function TrendingUpIcon<T>(props: TrendingUpProps<T>) {
  return (
    <Icon viewBox="0 0 33 20" xmlns="http://www.w3.org/2000/svg" {...props.options}>
      <path
        d={`M24.0835 1.41667L26.4835 3.81667L18.3501 11.95L12.8668 6.46667C12.2168 5.81667 
        11.1668 5.81667 10.5168 6.46667L0.516797 16.4833C-0.133203 17.1333 -0.133203 18.1833 
        0.516797 18.8333C1.1668 19.4833 2.2168 19.4833 2.8668 18.8333L11.6835 10L17.1668 
        15.4833C17.8168 16.1333 18.8668 16.1333 19.5168 15.4833L28.8335 6.18333L31.2335 
        8.58333C31.7501 9.1 32.6501 8.73333 32.6501 8V0.833333C32.6668 0.366667 32.3001 0 
        31.8335 0H24.6835C23.9335 0 23.5668 0.9 24.0835 1.41667Z`}
        fill={props.fill}
      />
    </Icon>
  );
}
