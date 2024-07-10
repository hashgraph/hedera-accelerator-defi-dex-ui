import { Card, Flex, Grid, GridItem, Image, Text } from "@chakra-ui/react";
import { Color, DefaultLogoIcon } from "@shared/ui-kit";
import { useNavigate } from "react-router-dom";
import { DAOType } from "@dao/services";
import { useFetchContract } from "@dao/hooks";

export interface DAOCardProps {
  accountEVMAddress: string;
  name: string;
  type: DAOType;
  logoUrl: string;
  isPrivate?: boolean;
}

export function DAOCard(props: DAOCardProps) {
  const { name, type, accountEVMAddress, logoUrl } = props;
  const navigate = useNavigate();
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;
  const bgColor = props.isPrivate ? Color.Yellow_01 : Color.White;

  function handleDAOCardClicked() {
    const daoTypePath = type.toLowerCase().replaceAll(" ", "-");
    navigate(`${daoTypePath}/${daoAccountId}`);
  }

  return (
    <Card
      variant="dao-card"
      onClick={handleDAOCardClicked}
      cursor="pointer"
      _hover={{ bg: Color.Neutral._100 }}
      bg={bgColor}
    >
      <Grid
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(6, 1fr)"
        gap={4}
        rowGap={1}
        border={`1px solid ${Color.Grey_01}`}
        borderRadius="4px"
        padding="1rem"
      >
        <GridItem rowSpan={2} colSpan={1} maxW="64px">
          <Image
            src={logoUrl}
            objectFit="contain"
            alt="DAO Logo URl"
            boxSize="3.5rem"
            fallback={<DefaultLogoIcon boxSize="3.5rem" color={Color.Grey_Blue._100} />}
          />
        </GridItem>
        <GridItem colSpan={5}>
          <Flex height="100%">
            <Text textStyle="b1" alignSelf="end" isTruncated>
              {name}
            </Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={5}>
          <Text textStyle="b3">{type}</Text>
        </GridItem>
      </Grid>
    </Card>
  );
}
