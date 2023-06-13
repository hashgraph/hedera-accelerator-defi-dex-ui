import { Box, chakra, Grid, GridItem } from "@chakra-ui/react";
import { MetricLabel } from "../";

interface Metric {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
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
          <MetricLabel
            labelLeftIcon={<Box bg={metric.color} width="0.75rem" height="0.75rem" />}
            label={metric.label}
            value={metric.value}
            valueStyle="p small semibold"
          />
        </GridItem>
      ))}
    </Grid>
  );
};

const Metrics = chakra(MetricsBase);
export { Metrics };
