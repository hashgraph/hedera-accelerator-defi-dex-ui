import { Flex, Text, Skeleton } from "@chakra-ui/react";

interface MetricLabelProps {
  label: string;
  value: string;
  isLoading?: boolean;
}

export const MetricLabel = (props: MetricLabelProps) => {
  const { label, value, isLoading = false } = props;

  return (
    <Flex flexDirection="column" gap="1">
      <Text textStyle="h4" opacity="0.8">
        {label}
      </Text>
      <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
        <Text textStyle="b1">{value}</Text>
      </Skeleton>
    </Flex>
  );
};
