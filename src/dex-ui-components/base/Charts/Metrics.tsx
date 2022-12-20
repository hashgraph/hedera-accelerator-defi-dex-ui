import { chakra, Circle, Flex, Grid, GridItem, Text, VStack } from "@chakra-ui/react";

interface Metric {
  label: string;
  value: number;
  color: string;
}

interface MetricsProps {
  data: Metric[];
  rows: number;
}

const MetricsBase = (props: MetricsProps) => {
  const { data, rows } = props;
  return (
    <Grid templateColumns={`repeat(${data.length}, 1fr)`} gap="4">
      {data.map((metric, index) => (
        <GridItem key={index} colSpan={rows}>
          <Flex gap="2">
            <Circle size="1em" bg={metric.color} />
            <VStack alignItems="left">
              <Text textStyle="h4">{metric.label}</Text>
              <Text textStyle="h2">{metric.value}</Text>
            </VStack>
          </Flex>
        </GridItem>
      ))}
    </Grid>
  );
};

const Metrics = chakra(MetricsBase);
export { Metrics };
