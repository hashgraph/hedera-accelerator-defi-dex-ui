import { chakra, Box, Flex } from "@chakra-ui/react";

interface HorizontalStackedBar {
  value: number;
  bg: string;
}

interface HorizontalSStackedBarChartProps {
  data: HorizontalStackedBar[];
  height?: string;
}

const HorizontalStackBarChartBase = (props: HorizontalSStackedBarChartProps) => {
  const { data, height = "15px" } = props;

  const getTotalValue = (): number => {
    return data.reduce((total: number, bar: HorizontalStackedBar) => {
      return total + bar.value;
    }, 0);
  };

  const computeBarWidthPercent = (value: number): string => {
    return `${((value / getTotalValue()) * 100).toFixed()}%`;
  };

  return (
    <Flex borderRadius="20px" overflow="hidden" height={height}>
      {data.map((bar: HorizontalStackedBar, index) => {
        return <Box width={computeBarWidthPercent(bar.value)} bg={bar.bg} key={index}></Box>;
      })}
    </Flex>
  );
};
const HorizontalStackBarChart = chakra(HorizontalStackBarChartBase);

export type { HorizontalStackedBar };
export { HorizontalStackBarChart };
