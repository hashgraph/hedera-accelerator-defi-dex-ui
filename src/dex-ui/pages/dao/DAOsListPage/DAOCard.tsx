import { Text, Grid, GridItem, Flex, Card } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Color } from "@dex-ui-components";
import { useNavigate } from "react-router-dom";
import { Paths } from "@routes";
import { DAOType } from "@services";

export interface DAOCardProps {
  key: React.Key | null | undefined;
  accountId: string;
  name: string;
  type: DAOType;
  logo?: ReactNode;
}

export function DAOCard(props: DAOCardProps) {
  const { key, name, type, accountId } = props;
  const navigate = useNavigate();

  function handleDAOCardClicked() {
    navigate(`${Paths.DAOs.DAODetails}/${accountId}`);
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
