import { Progress, ProgressProps } from "@chakra-ui/react";
import { Color } from "../../";
interface ProgressBarProps extends ProgressProps {
  progressBarColor: string;
}

export function ProgressBar(props: ProgressBarProps) {
  const { progressBarColor } = props;
  return (
    <Progress
      {...props}
      bg={Color.Neutral._200}
      sx={{
        "& > div": {
          background: `${progressBarColor}`,
        },
      }}
    />
  );
}
