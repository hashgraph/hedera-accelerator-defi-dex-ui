import { Flex, Text, Skeleton } from "@chakra-ui/react";

interface MetricLabelProps {
  label: string;
  value: string;
  isLoading?: boolean;
}

export const MetricLabel = (props: MetricLabelProps) => {
  const { label, value, isLoading = false } = props;

  return (
    <Flex flexDirection={"column"}>
      <Text fontSize={"10px"} lineHeight={"12px"}>
        {label}
      </Text>
      <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
        <Text fontSize={"14px"} lineHeight={"17px"}>
          {value}
        </Text>
      </Skeleton>
    </Flex>
  );
};
