import { Text, Box, Grid, GridItem, Flex, Card } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Color } from "../../../dex-ui-components";
import { useNavigate } from "react-router-dom";
import { DAOType } from "../CreateADAO";
import { Paths } from "../../DEX";

export interface DAOCardProps {
  key: React.Key | null | undefined;
  address: string;
  name: string;
  type: DAOType;
  logo?: ReactNode;
}

export function DAOCard(props: DAOCardProps) {
  const { key, logo, name, type, address } = props;
  const navigate = useNavigate();

  function handleDAOCardClicked() {
    navigate(`${Paths.DAOs.ViewDAODetails}/${address}`);
  }

  return (
    <Card key={key} variant="dao-card" onClick={handleDAOCardClicked}>
      <Grid
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(5, 1fr)"
        gap={4}
        rowGap={1}
        border={`1px solid ${Color.Grey_01}`}
        borderRadius="4px"
        padding="1rem"
      >
        <GridItem rowSpan={2} colSpan={1}>
          {logo ? logo : <Box height="3.5rem" width="3.5rem" borderRadius="4px" bg={Color.Grey_02} />}
        </GridItem>
        <GridItem colSpan={4}>
          <Flex height="100%">
            <Text textStyle="b1" height="fit-content" alignSelf="end">
              {name}
            </Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={4}>
          <Text textStyle="b3">{type}</Text>
        </GridItem>
      </Grid>
    </Card>
  );
}
