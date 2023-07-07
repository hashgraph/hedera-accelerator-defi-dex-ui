import { chakra, Text, Box, Flex } from "@chakra-ui/react";
import { Color } from "../../themes";

interface HorizontalStackedBar {
  value: number;
  bg: string;
}

interface HorizontalSStackedBarChartProps {
  data: HorizontalStackedBar[];
  quorum?: number;
  stackBarHeight?: number;
}

const HorizontalStackBarChartBase = (props: HorizontalSStackedBarChartProps) => {
  const { data, quorum, stackBarHeight = 12 } = props;

  const getTotalValue = (): number => {
    return data.reduce((total: number, bar: HorizontalStackedBar) => {
      return total + bar.value;
    }, 0);
  };

  const computeBarWidthPercent = (value: number): string => {
    return `${((value / getTotalValue()) * 100).toFixed()}%`;
  };

  return (
    <Flex position="relative" borderRadius="20px" height={`${stackBarHeight}px`}>
      <Flex
        position="absolute"
        left={`${quorum}%`}
        direction="column"
        alignItems="center"
        transform="translateY(-22px)"
        width="0px"
      >
        <Box bg={Color.Black_01} padding="0.125rem 0.25rem">
          <Text textStyle="h4" color={Color.White_01}>
            {quorum}%
          </Text>
        </Box>
        <Box width="0" border={`1px solid ${Color.Black_01}`} height={`${stackBarHeight + 5}px`} />
      </Flex>
      {data.map((bar: HorizontalStackedBar, index) => {
        return <Box width={computeBarWidthPercent(bar.value)} bg={bar.bg} key={index}></Box>;
      })}
    </Flex>
  );
};
const HorizontalStackBarChart = chakra(HorizontalStackBarChartBase);

export type { HorizontalStackedBar };
export { HorizontalStackBarChart };
