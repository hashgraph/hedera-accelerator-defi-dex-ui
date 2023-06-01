import { Text, Flex, Box } from "@chakra-ui/react";
import { ArrowLeftIcon, Breadcrumb, BreadcrumbText } from "@dex-ui-components";
import { Paths } from "@routes";
import { Link as ReachLink } from "react-router-dom";

interface ProposalDetailsHeaderProps {
  daoAccountId: string;
  title: string;
  /* author: string; */
}

export function ProposalDetailsHeader(props: ProposalDetailsHeaderProps) {
  const { daoAccountId, title } = props;
  return (
    <>
      <Flex direction="row" justifyContent="space-between" flexWrap="wrap-reverse" gap="2">
        <Box flex="1">
          <BreadcrumbText />
        </Box>
        <Flex>
          <Breadcrumb
            to={`/daos/multisig/${daoAccountId}/${Paths.DAOs.Proposals}`}
            as={ReachLink}
            label={"Back to Proposals"}
            leftIcon={<ArrowLeftIcon options={{ w: 3, h: 3 }} />}
          />
        </Flex>
      </Flex>
      <Flex direction="column" gap="2">
        <Text textStyle="h3 medium">{title}</Text>
        {/** TODO: Determine how to get transaction author */}
        {/**
         * ```
         * <Flex direction="row" alignItems="center" gap="2">
         *    <Text textStyle="p small medium" color={Color.Neutral._500}>
         *      Author By
         *    </Text>
         *    <HashScanLink id={author} type={HashscanData.Account} />
         * </Flex>
         * ```
         */}
      </Flex>
    </>
  );
}
