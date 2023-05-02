import { Progress, ProgressProps } from "@chakra-ui/react";

interface ProgressBarProps extends ProgressProps {
  progressBarColor: string;
}

export function ProgressBar(props: ProgressBarProps) {
  const { progressBarColor } = props;
  return (
    <Progress
      {...props}
      sx={{
        "& > div": {
          background: `${progressBarColor}`,
        },
      }}
    />
  );
}
