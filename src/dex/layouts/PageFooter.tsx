import { Flex, Link, Spacer } from "@chakra-ui/react";
import { Color, GithubIcon, Text } from "@shared/ui-kit";

export function PageFooter() {
  return (
    <Flex layerStyle="footer" mt="5">
      {/* Left - Copyright */}
      <Text.P_XSmall_Regular color={Color.Neutral._500}>
        <Link href="https://hedera.com" textStyle="p small regular link" color={Color.Primary._500}>
          Hashgraph
        </Link>{" "}
        © 2025
      </Text.P_XSmall_Regular>

      <Spacer />

      {/* Center - Legal links */}
      <Flex direction="row" alignItems="center" gap={{ base: 3, md: 6 }}>
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
      </Flex>

      <Spacer />

      {/* Right - GitHub links */}
      <Flex direction="row" alignItems="center" gap={{ base: 3, md: 6 }}>
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
