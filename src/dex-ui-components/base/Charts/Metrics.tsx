import { chakra, Grid, GridItem, HStack, Spacer, Text } from "@chakra-ui/react";
interface Metric {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

interface MetricsProps {
  data: Metric[];
  rows: number;
}

const MetricsBase = (props: MetricsProps) => {
  const { data, rows } = props;
  return (
    <Grid templateColumns={`repeat(${data.length}, 1fr)`} gap="5">
      {data.map((metric, index) => (
        <GridItem key={index} colSpan={rows}>
          <HStack width="100%">
            {metric.icon ? (
              <HStack gap="1">
                {metric.icon}
                <Text textStyle="b4">{metric.label}</Text>
              </HStack>
            ) : (
              <Text textStyle="b4">{metric.label}</Text>
            )}
            <Spacer />
            <Text textStyle="b1">{metric.value}</Text>
          </HStack>
        </GridItem>
      ))}
    </Grid>
  );
};

const Metrics = chakra(MetricsBase);
export { Metrics };
