import { Flex, Link } from "@chakra-ui/react";
import { NetworkSwitcher } from "@dex/components";
import { Color, GithubIcon, Text } from "@shared/ui-kit";

export function PageFooter() {
  return (
    <Flex layerStyle="footer" alignItems="flex-end" mt="5">
      <Text.P_XSmall_Regular>
        <Link href="https://swirldslabs.com" textStyle="p small regular link" color={Color.Primary._500}>
          Swirlds Labs
        </Link>{" "}
        © 2023 - 2024
      </Text.P_XSmall_Regular>
      <Flex direction="row" alignItems="flex-end" gap="8">
        <Link
          textStyle="p small regular link"
          color={Color.Primary._500}
          href="https://swirldslabs.com/terms-of-service/"
          isExternal={true}
        >
          Terms &amp; Conditions
        </Link>
        <Link
          textStyle="p small regular link"
          color={Color.Primary._500}
          href="https://swirldslabs.com/privacy-policy"
          isExternal={true}
        >
          Privacy Policy
        </Link>
        <Link
          textStyle="p small regular link"
          color={Color.Primary._500}
          href="https://skynet.certik.com/projects/swirlds-labs-dao-as-a-service"
          isExternal={true}
        >
          Audit by Certik
        </Link>
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
        <NetworkSwitcher />
      </Flex>
    </Flex>
  );
}
