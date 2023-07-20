import { Link, Text, Flex } from "@chakra-ui/react";
import { Color, GithubIcon } from "@dex-ui-components";

export function PageFooter() {
  return (
    <Flex layerStyle="footer">
      <Text textStyle="p xsmall regular">Hedera © 2023</Text>
      <Flex direction="row" alignItems="center" gap="8">
        <Link
          textStyle="p small regular link"
          color={Color.Primary._500}
          href="https://github.com/hashgraph/hedera-accelerator-defi-dex-ui"
          isExternal={true}
        >
          <Flex direction="row" gap="1" alignItems="center">
            <GithubIcon fill={Color.Primary._500} /> UI
          </Flex>
        </Link>
        <Link
          textStyle="p small regular link"
          color={Color.Primary._500}
          href="https://github.com/hashgraph/hedera-accelerator-defi-dex"
          isExternal={true}
        >
          <Flex direction="row" gap="1" alignItems="center">
            <GithubIcon fill={Color.Primary._500} /> Smart Contracts
          </Flex>
        </Link>
      </Flex>
    </Flex>
  );
}
