import { chakra, Circle, Flex, HStack, Text } from "@chakra-ui/react";

interface Metric {
  /** The label prop can be re-used for the next UI iteration. */
  label?: string;
  value: number;
  color: string;
}

interface MetricsProps {
  data: Metric[];
}

const MetricsBase = (props: MetricsProps) => {
  const { data } = props;
  return (
    <Flex>
      {data.map((metric, index) => (
        <HStack flex="1" key={index}>
          <Circle size="1em" bg={metric.color} />
          <Text>{metric.value}</Text>
        </HStack>
      ))}
    </Flex>
  );
};

const Metrics = chakra(MetricsBase);
export { Metrics };
