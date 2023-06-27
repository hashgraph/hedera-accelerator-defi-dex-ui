import { Text, Flex, Box } from "@chakra-ui/react";
import { Breadcrumb, BreadcrumbText, Color, HashscanData, HashScanLink } from "@dex-ui-components";
import { DAOType } from "@services";
import { Paths } from "@routes";

interface ProposalDetailsHeaderProps {
  daoAccountId: string;
  title: string;
  daoType: DAOType;
  author: string;
  /* author: string; */
}

export function ProposalDetailsHeader(props: ProposalDetailsHeaderProps) {
  const { daoAccountId, title, daoType, author } = props;
  let to = `/daos/${Paths.DAOs.Multisig}/${daoAccountId}/${Paths.DAOs.Proposals}`;
  if (daoType === DAOType.GovernanceToken) {
    to = `/daos/${Paths.DAOs.GovernanceToken}/${daoAccountId}/${Paths.DAOs.Proposals}`;
  }
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
