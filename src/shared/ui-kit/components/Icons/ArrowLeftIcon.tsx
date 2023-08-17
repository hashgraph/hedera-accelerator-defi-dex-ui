import { Icon } from "@chakra-ui/react";
import { Color } from "../../themes";

interface ArrowLeftIconProps<T> {
  fill?: string;
  options?: T;
}

export function ArrowLeftIcon<T>(props: ArrowLeftIconProps<T>) {
  const { fill = Color.Primary._500, options } = props;
  return (
    <Icon boxSize="0.75rem" viewBox="0 0 6 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...options}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.52372 11.8333C5.28039 11.8333 5.03872 11.7275 4.87372 11.5225L0.850387 
        6.5225C0.602054 6.21333 0.605387 5.77166 0.859554 5.46666L5.02622 0.466663C5.32039 
        0.11333 5.84622 0.0658299 6.20039 0.359997C6.55372 0.654163 6.60122 1.18 6.30622 1.53333L2.57705 
        6.00916L6.17289 10.4775C6.46122 10.8358 6.40455 11.3608 6.04539 11.6492C5.89205 11.7733 5.70705 
        11.8333 5.52372 11.8333Z"
        fill={fill}
      />
    </Icon>
  );
}
