import { Flex, Link, Spacer, Box, HStack, Text } from "@chakra-ui/react";
import { useTheme, GithubIcon } from "@shared/ui-kit";

export function PageFooter() {
  const theme = useTheme();

  return (
    <Flex layerStyle="footer" bg={theme.bg} borderTop={`1px solid ${theme.border}`}>
      {/* Left - Logo & Copyright */}
      <HStack spacing={2}>
        <Box
          w="24px"
          h="24px"
          borderRadius="6px"
          bg="linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="xs" fontWeight="900" color="white">
            H
          </Text>
        </Box>
        <Text fontSize="sm" color={theme.textMuted}>
          2025 Hashgraph
        </Text>
      </HStack>

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
