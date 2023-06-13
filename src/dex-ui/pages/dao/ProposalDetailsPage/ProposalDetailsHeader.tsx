import { Text, Flex, Box } from "@chakra-ui/react";
import { ArrowLeftIcon, Breadcrumb, BreadcrumbText, Color, HashScanLink, HashscanData } from "@dex-ui-components";
import { DAOType } from "@dex-ui/services";
import { Paths } from "@routes";
import { Link as ReachLink } from "react-router-dom";

const getPathByType = {
  [DAOType.MultiSig]: Paths.DAOs.Multisig,
  [DAOType.GovernanceToken]: Paths.DAOs.GovernanceToken,
  [DAOType.NFT]: Paths.DAOs.NFT,
};

interface ProposalDetailsHeaderProps {
  daoAccountId: string;
  title: string;
  type: DAOType;
  author: string;
}

export function ProposalDetailsHeader(props: ProposalDetailsHeaderProps) {
  const { daoAccountId, title, type, author } = props;
  return (
    <>
      <Flex direction="row" justifyContent="space-between" flexWrap="wrap-reverse" gap="2">
        <Box flex="1">
          <BreadcrumbText />
        </Box>
        <Flex>
          <Breadcrumb
            to={`/daos/${getPathByType[type]}/${daoAccountId}/${Paths.DAOs.Proposals}`}
            as={ReachLink}
            label={"Back to Proposals"}
            leftIcon={<ArrowLeftIcon options={{ w: 3, h: 3 }} />}
          />
        </Flex>
      </Flex>
      <Flex direction="column" gap="2">
        <Text textStyle="h3 medium">{title}</Text>
        <Flex direction="row" alignItems="center" gap="2">
          <Text textStyle="p small medium" color={Color.Neutral._500}>
            Author By
          </Text>
          <HashScanLink id={author ?? "-"} type={HashscanData.Account} />
        </Flex>
      </Flex>
    </>
  );
}
