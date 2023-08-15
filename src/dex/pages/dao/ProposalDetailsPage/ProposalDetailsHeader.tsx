import { Text, Flex, Box } from "@chakra-ui/react";
import { Breadcrumb, BreadcrumbText, Color, HashscanData, HashScanLink } from "@shared/ui-kit";
import { DAOType } from "@dex/services";
import { DAORoutes } from "@dex/routes";

interface ProposalDetailsHeaderProps {
  daoAccountId: string;
  title: string;
  daoType: DAOType;
  author: string;
  /* author: string; */
}

export function ProposalDetailsHeader(props: ProposalDetailsHeaderProps) {
  const { daoAccountId, title, daoType, author } = props;
  const to = `/${
    daoType === DAOType.GovernanceToken
      ? DAORoutes.GovernanceToken
      : daoType === DAOType.NFT
      ? DAORoutes.NFT
      : DAORoutes.Multisig
  }/${daoAccountId}/${DAORoutes.Proposals}`;
  return (
    <>
      <Flex direction="row" justifyContent="space-between" flexWrap="wrap-reverse" gap="2">
        <Box flex="1">
          <BreadcrumbText />
        </Box>
        <Flex>
          <Breadcrumb to={to} label={"Back to Proposals"} />
        </Flex>
      </Flex>
      <Flex direction="column" gap="2">
        <Text textStyle="h3 medium">{title}</Text>
        <Flex direction="row" alignItems="center" gap="2">
          <Text textStyle="p small medium" color={Color.Neutral._500}>
            Author By:
          </Text>
          <HashScanLink id={author} type={HashscanData.Account} />
        </Flex>
      </Flex>
    </>
  );
}
