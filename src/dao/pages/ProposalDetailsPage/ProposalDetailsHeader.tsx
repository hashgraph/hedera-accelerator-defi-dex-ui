import { Flex, Box, useBreakpointValue } from "@chakra-ui/react";
import { Text, Breadcrumb, BreadcrumbText, Color, HashscanData, HashScanLink } from "@shared/ui-kit";
import { DAOType } from "@dao/services";
import { Routes } from "@dao/routes";

interface ProposalDetailsHeaderProps {
  daoAccountId: string;
  title: string;
  daoType: DAOType;
  author: string;
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

  const titleSize = useBreakpointValue({ base: "md", md: "lg", lg: "xl" });

  return (
    <>
      <Flex
        direction={{ base: "column-reverse", sm: "row" }}
        justifyContent="space-between"
        flexWrap="wrap-reverse"
        gap={{ base: 2, md: 2 }}
      >
        <Box flex="1" display={{ base: "none", md: "block" }}>
          <BreadcrumbText />
        </Box>
        <Flex>
          <Breadcrumb to={to} label={"Back to Proposals"} />
        </Flex>
      </Flex>
      <Flex direction="column" gap={{ base: 1, md: 2 }}>
        <Text.H3_Medium fontSize={{ base: "lg", md: "xl", lg: "2xl" }} wordBreak="break-word">
          {title}
        </Text.H3_Medium>
        <Flex
          direction={{ base: "column", sm: "row" }}
          alignItems={{ base: "flex-start", sm: "center" }}
          gap={{ base: 1, sm: 2 }}
        >
          <Text.P_Small_Medium color={Color.Neutral._500} fontSize={{ base: "xs", md: "sm" }}>
            Author By:
          </Text.P_Small_Medium>
          <HashScanLink id={author} type={HashscanData.Account} />
        </Flex>
      </Flex>
    </>
  );
}
