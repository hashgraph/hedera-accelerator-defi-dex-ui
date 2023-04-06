import { Text, Grid, GridItem } from "@chakra-ui/react";

interface MultiSigDAODashboardProps {
  address: string;
}

export function MultiSigDAODashboard(props: MultiSigDAODashboardProps) {
  const { address } = props;
  return (
    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
      <GridItem colSpan={1} h="100" bg="blue.500">
        <Text textStyle="h3">Overview</Text>
      </GridItem>
      <GridItem colSpan={1} h="100" bg="blue.500">
        <Text textStyle="h3">Owners</Text>
      </GridItem>
      <GridItem colSpan={1} h="100" bg="blue.500">
        <Text textStyle="h3">Assets</Text>
      </GridItem>
      <GridItem colSpan={3} gap="0.25rem" h="100" bg="blue.500">
        <Text textStyle="h3">Transactions</Text>
      </GridItem>
    </Grid>
  );
}
