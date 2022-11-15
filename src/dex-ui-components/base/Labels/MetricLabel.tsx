import { Flex, Text, Skeleton } from "@chakra-ui/react";

interface MetricLabelProps {
  label: string;
  value: string;
  isLoading?: boolean;
}

export const MetricLabel = (props: MetricLabelProps) => {
  const { label, value, isLoading = false } = props;

  return (
    <Flex flexDirection="column">
      <Text textStyle="h4">{label}</Text>
      <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
        <Text textStyle="b3">{value}</Text>
      </Skeleton>
    </Flex>
  );
};
