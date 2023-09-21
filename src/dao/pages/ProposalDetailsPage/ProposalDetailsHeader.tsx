import { Flex, Box } from "@chakra-ui/react";
import { Text, Breadcrumb, BreadcrumbText, Color, HashscanData, HashScanLink } from "@shared/ui-kit";
import { DAOType } from "@dao/services";
import { Routes } from "@dao/routes";

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
      ? Routes.GovernanceToken
      : daoType === DAOType.NFT
      ? Routes.NFT
      : Routes.Multisig
  }/${daoAccountId}/${Routes.Proposals}`;
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
        <Text.H3_Medium>{title}</Text.H3_Medium>
        <Flex direction="row" alignItems="center" gap="2">
          <Text.P_Small_Medium color={Color.Neutral._500}>Author By:</Text.P_Small_Medium>
          <HashScanLink id={author} type={HashscanData.Account} />
        </Flex>
      </Flex>
    </>
  );
}
