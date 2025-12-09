import { Flex, Link, Spacer, HStack, Text } from "@chakra-ui/react";
import { useTheme, GithubIcon } from "@shared/ui-kit";

export function PageFooter() {
  const theme = useTheme();

  return (
    <Flex layerStyle="footer" bg={theme.bg} borderTop={`1px solid ${theme.border}`}>
      {/* Left - Copyright */}
      <Link
        href="https://www.hashgraph.com/"
        isExternal={true}
        _hover={{ color: theme.text, textDecoration: "none" }}
        transition="color 0.2s"
      >
        <Text fontSize="sm" color={theme.textMuted}>
          © 2025 Hashgraph
        </Text>
      </Link>

      <Spacer />

      {/* Center - Legal links */}
      <HStack spacing={{ base: 3, md: 6 }}>
        <Link
          fontSize="sm"
          color={theme.textMuted}
          href="https://www.hashgraph.com/terms-of-service/"
          isExternal={true}
          _hover={{ color: theme.text }}
          transition="color 0.2s"
        >
          Terms
        </Link>
        <Link
          fontSize="sm"
          color={theme.textMuted}
          href="https://www.hashgraph.com/privacy-policy/"
          isExternal={true}
          _hover={{ color: theme.text }}
          transition="color 0.2s"
        >
          Privacy
        </Link>
        <Link
          fontSize="sm"
          color={theme.textMuted}
          href="https://skynet.certik.com/projects/swirlds-labs-dao-as-a-service"
          isExternal={true}
          _hover={{ color: theme.text }}
          transition="color 0.2s"
        >
          Audit
        </Link>
      </HStack>

      <Spacer />

      {/* Right - GitHub links */}
      <HStack spacing={{ base: 3, md: 6 }}>
        <Link
          fontSize="sm"
          color={theme.textMuted}
          href="https://github.com/hashgraph/hedera-accelerator-defi-dex-ui"
          isExternal={true}
          _hover={{ color: theme.text }}
          transition="color 0.2s"
        >
          <Flex direction="row" gap="1" alignItems="center">
            <GithubIcon fill={theme.textMuted} boxSize="14px" /> UI
          </Flex>
        </Link>
        <Link
          fontSize="sm"
          color={theme.textMuted}
          href="https://github.com/hashgraph/hedera-accelerator-defi-dex"
          isExternal={true}
          _hover={{ color: theme.text }}
          transition="color 0.2s"
        >
          <Flex direction="row" gap="1" alignItems="center">
            <GithubIcon fill={theme.textMuted} boxSize="14px" /> Contracts
          </Flex>
        </Link>
      </HStack>
    </Flex>
  );
}
