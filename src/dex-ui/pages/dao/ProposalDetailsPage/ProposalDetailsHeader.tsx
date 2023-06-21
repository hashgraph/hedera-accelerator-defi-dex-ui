import { Text, Flex, Box } from "@chakra-ui/react";
import { Breadcrumb, BreadcrumbText } from "@dex-ui-components";
import { Paths } from "@routes";

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
            to={`/daos/${Paths.DAOs.Multisig}/${daoAccountId}/${Paths.DAOs.Proposals}`}
            label={"Back to Proposals"}
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
