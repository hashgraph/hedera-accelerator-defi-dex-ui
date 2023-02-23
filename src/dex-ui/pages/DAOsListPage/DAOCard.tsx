import { Text, Box, Grid, GridItem, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Color } from "../../../dex-ui-components";

interface DAOCardProps {
  name: string;
  category: string;
  logo?: ReactNode;
}

export function DAOCard(props: DAOCardProps) {
  return (
    <Grid
      templateRows="repeat(2, 1fr)"
      templateColumns="repeat(5, 1fr)"
      gap={2}
      rowGap={1}
      border={`1px solid ${Color.Grey_01}`}
      borderRadius="4px"
      padding="1rem 1.5rem"
    >
      <GridItem rowSpan={2} colSpan={1}>
        {props.logo ? props.logo : <Box height="3.5rem" width="3.5rem" bg={Color.Grey_02} />}
      </GridItem>
      <GridItem colSpan={4}>
        <Flex height="100%">
          <Text textStyle="b1" height="fit-content" alignSelf="end">
            {props.name}
          </Text>
        </Flex>
      </GridItem>
      <GridItem colSpan={4}>
        <Text textStyle="b3">{props.category}</Text>
      </GridItem>
    </Grid>
  );
}
