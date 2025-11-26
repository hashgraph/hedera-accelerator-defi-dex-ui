import { Card, Flex, Grid, GridItem, Image, Text, Badge } from "@chakra-ui/react";
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
  const { name, type, accountEVMAddress, logoUrl, isPrivate } = props;
  const navigate = useNavigate();
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;
  const bgColor = isPrivate ? Color.Private.Bg : Color.White;
  const borderColor = isPrivate ? Color.Private.Border : Color.Neutral._200;
  const hoverBgColor = isPrivate ? Color.Private.BgHover : Color.Neutral._50;

  function handleDAOCardClicked() {
    const daoTypePath = type.toLowerCase().replaceAll(" ", "-");
    navigate(`${daoTypePath}/${daoAccountId}`);
  }

  return (
    <Card
      variant="dao-card"
      onClick={handleDAOCardClicked}
      cursor="pointer"
      _hover={{ bg: hoverBgColor, transform: "translateY(-2px)" }}
      bg={bgColor}
      transition="all 0.2s ease-in-out"
      position="relative"
    >
      {isPrivate && (
        <Badge
          position="absolute"
          top="0.5rem"
          right="0.5rem"
          bg={Color.Private.Accent}
          color="white"
          fontSize="10px"
          px="2"
          py="0.5"
          borderRadius="4px"
        >
          Private
        </Badge>
      )}
      <Grid
        templateRows="repeat(2, 1fr)"
        templateColumns={{ base: "auto 1fr", sm: "repeat(6, 1fr)" }}
        gap={{ base: 2, md: 4 }}
        rowGap={1}
        border={`1px solid ${borderColor}`}
        borderRadius="12px"
        padding={{ base: "0.75rem", md: "1rem" }}
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
