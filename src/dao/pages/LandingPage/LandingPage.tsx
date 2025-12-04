import { Box, Button, Container, Flex, Grid, Heading, Text, VStack, HStack, keyframes } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Color, useTheme, useThemeMode, ThemeToggle, HashDaoIcon } from "@shared/ui-kit";
import { Routes } from "@dao/routes";

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 60px rgba(126, 34, 206, 0.3); }
  50% { box-shadow: 0 0 100px rgba(126, 34, 206, 0.6); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const orbit = keyframes`
  from { transform: rotate(0deg) translateX(150px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
`;

export function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDark } = useThemeMode();

  return (
    <Box bg={theme.bg} minH="100vh" overflow="hidden" position="relative">
      {/* Gradient Orbs */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg={
          isDark
            ? "radial-gradient(circle, rgba(126, 34, 206, 0.4) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(126, 34, 206, 0.15) 0%, transparent 70%)"
        }
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg={
          isDark
            ? "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
        }
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        top="40%"
        right="20%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg={
          isDark
            ? "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)"
        }
        filter="blur(60px)"
        pointerEvents="none"
      />

      {/* Navigation */}
      <Flex
        as="nav"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex={200}
        padding={{ base: "0.75rem 1rem", sm: "1rem 1.5rem", md: "1rem 2rem" }}
        height="65px"
        justify="space-between"
        align="center"
        bg={theme.navbarBg}
        backdropFilter="blur(20px)"
        borderBottom={`1px solid ${theme.border}`}
        gap={{ base: "2", md: "4" }}
      >
        <HStack spacing={2}>
          <HashDaoIcon boxSize="36px" />
          <Text fontSize="md" fontWeight="600" color={theme.text} display={{ base: "none", sm: "block" }}>
            HashioDAO
          </Text>
        </HStack>
        <HStack spacing={4}>
          <Button
            variant="ghost"
            color={theme.textSecondary}
            fontWeight="500"
            _hover={{ color: theme.text, bg: isDark ? "whiteAlpha.100" : "blackAlpha.50" }}
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            Learn
          </Button>
          <ThemeToggle />
          <Button
            px={6}
            py={5}
            bg={isDark ? "white" : theme.accent}
            color={isDark ? "#0A0A0F" : "white"}
            fontWeight="600"
            borderRadius="full"
            _hover={{
              transform: "scale(1.05)",
              boxShadow: isDark ? "0 0 30px rgba(255,255,255,0.3)" : "0 0 30px rgba(126, 34, 206, 0.4)",
            }}
            transition="all 0.2s"
            onClick={() => navigate(Routes.App)}
          >
            Open App
          </Button>
        </HStack>
      </Flex>

      {/* Hero Section */}
      <Container maxW="1400px" pt={{ base: 32, md: 40 }} pb={20} px={{ base: 4, md: 8 }}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="center">
          {/* Left Content */}
          <VStack align={{ base: "center", lg: "flex-start" }} spacing={8} textAlign={{ base: "center", lg: "left" }}>
            <Box
              px={4}
              py={2}
              bg="rgba(126, 34, 206, 0.15)"
              borderRadius="full"
              border="1px solid rgba(126, 34, 206, 0.3)"
              animation={`${slideUp} 0.6s ease-out`}
            >
              <Text fontSize="sm" color={isDark ? Color.Primary._300 : Color.Primary._700} fontWeight="600">
                Powered by Hedera
              </Text>
            </Box>

            <Heading
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl", xl: "7xl" }}
              fontWeight="800"
              color={theme.text}
              lineHeight="1.05"
              letterSpacing="-2px"
              animation={`${slideUp} 0.6s ease-out 0.1s both`}
            >
              Governance
              <br />
              <Text as="span" bgGradient="linear(to-r, #A855F7, #6366F1, #A855F7)" bgClip="text" bgSize="200% auto">
                Reimagined
              </Text>
            </Heading>

            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color={theme.textSecondary}
              maxW="500px"
              lineHeight="1.8"
              animation={`${slideUp} 0.6s ease-out 0.2s both`}
            >
              Create unstoppable organizations. Vote on-chain. Manage shared treasuries. Built for Governance Tokens,
              Multisig, and NFTs.
            </Text>

            <HStack spacing={4} pt={4} animation={`${slideUp} 0.6s ease-out 0.3s both`}>
              <Button
                size="lg"
                px={8}
                py={7}
                bg="linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)"
                color="white"
                fontWeight="600"
                borderRadius="full"
                fontSize="md"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 20px 40px rgba(126, 34, 206, 0.4)",
                }}
                transition="all 0.2s"
                onClick={() => navigate(Routes.App)}
              >
                Launch App
              </Button>
              <Button
                size="lg"
                px={8}
                py={7}
                bg="transparent"
                color={theme.text}
                fontWeight="600"
                borderRadius="full"
                fontSize="md"
                border={`1px solid ${theme.border}`}
                _hover={{
                  bg: isDark ? "whiteAlpha.100" : "blackAlpha.50",
                  borderColor: theme.borderHover,
                }}
                transition="all 0.2s"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </HStack>
          </VStack>

          {/* Right Visual - 3D Card Stack */}
          <Flex
            justify="center"
            align="center"
            position="relative"
            minH={{ base: "300px", lg: "500px" }}
            display={{ base: "none", lg: "flex" }}
          >
            {/* Orbiting Elements */}
            <Box
              position="absolute"
              w="20px"
              h="20px"
              borderRadius="full"
              bg={Color.Primary._500}
              animation={`${orbit} 8s linear infinite`}
            />
            <Box
              position="absolute"
              w="12px"
              h="12px"
              borderRadius="full"
              bg="#6366F1"
              animation={`${orbit} 12s linear infinite reverse`}
            />

            {/* Main Card */}
            <Box
              position="relative"
              w="340px"
              borderRadius="24px"
              bg="linear-gradient(145deg, rgba(30,30,40,0.9) 0%, rgba(20,20,28,0.9) 100%)"
              border="1px solid rgba(255,255,255,0.1)"
              backdropFilter="blur(20px)"
              p={5}
              animation={`${float} 6s ease-in-out infinite, ${glow} 4s ease-in-out infinite`}
              transform="perspective(1000px) rotateY(-5deg) rotateX(5deg)"
              _hover={{
                transform: "perspective(1000px) rotateY(0deg) rotateX(0deg)",
              }}
              transition="transform 0.4s ease-out"
            >
              {/* Card Header */}
              <HStack justify="space-between" mb={5}>
                <HStack spacing={3}>
                  <HashDaoIcon boxSize="48px" />
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontWeight="700" fontSize="md">
                      Acme DAO
                    </Text>
                    <HStack spacing={2}>
                      <Box
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        bg="rgba(126, 34, 206, 0.2)"
                        border="1px solid rgba(126, 34, 206, 0.3)"
                      >
                        <Text fontSize="10px" color={Color.Primary._400} fontWeight="600">
                          Governance Token
                        </Text>
                      </Box>
                      <Box
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        bg="rgba(74, 222, 128, 0.15)"
                        border="1px solid rgba(74, 222, 128, 0.3)"
                      >
                        <Text fontSize="10px" color="#4ADE80" fontWeight="600">
                          Admin
                        </Text>
                      </Box>
                    </HStack>
                  </VStack>
                </HStack>
              </HStack>

              {/* Voting Power */}
              <Box
                bg="rgba(255,255,255,0.03)"
                borderRadius="16px"
                p={4}
                mb={3}
                border="1px solid rgba(255,255,255,0.05)"
              >
                <Text color="whiteAlpha.600" fontSize="xs" mb={2}>
                  VOTING POWER
                </Text>
                <HStack align="baseline" spacing={2}>
                  <Text color={Color.Primary._400} fontWeight="700" fontSize="2xl">
                    5000
                  </Text>
                  <Text color={Color.Primary._400} fontWeight="600" fontSize="sm">
                    ACME
                  </Text>
                </HStack>
              </Box>

              {/* Recent Proposal */}
              <Box bg="rgba(255,255,255,0.03)" borderRadius="16px" p={4} border="1px solid rgba(255,255,255,0.05)">
                <Text color="whiteAlpha.600" fontSize="xs" mb={2}>
                  RECENT PROPOSAL
                </Text>
                <Text color="white" fontWeight="600" fontSize="sm" mb={2}>
                  Allocate 50,000 HBAR for Q1
                </Text>
                <HStack spacing={2}>
                  <Box px={2} py={0.5} borderRadius="full" bg="rgba(74, 222, 128, 0.15)">
                    <Text fontSize="10px" color="#4ADE80" fontWeight="600">
                      Executed
                    </Text>
                  </Box>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    Turnout: 72%
                  </Text>
                </HStack>
              </Box>

              {/* New Proposal Button */}
              <Button
                mt={4}
                w="full"
                size="sm"
                bg="linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)"
                color="white"
                fontWeight="600"
                borderRadius="full"
                _hover={{ opacity: 0.9 }}
              >
                New Proposal
              </Button>
            </Box>

            {/* Background Cards */}
            <Box
              position="absolute"
              w="340px"
              h="380px"
              borderRadius="24px"
              bg="rgba(30,30,40,0.4)"
              border="1px solid rgba(255,255,255,0.05)"
              transform="translateX(25px) translateY(25px) scale(0.96)"
              zIndex={-1}
            />
            <Box
              position="absolute"
              w="340px"
              h="380px"
              borderRadius="24px"
              bg="rgba(30,30,40,0.2)"
              border="1px solid rgba(255,255,255,0.02)"
              transform="translateX(50px) translateY(50px) scale(0.92)"
              zIndex={-2}
            />
          </Flex>
        </Grid>
      </Container>

      {/* Knowledge Hub Section */}
      <Box id="features" py={{ base: 16, md: 24 }} position="relative">
        <Container maxW="1400px" px={{ base: 4, md: 8 }}>
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Text
                fontSize="sm"
                color={Color.Primary._400}
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="2px"
              >
                Resources
              </Text>
              <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="800" color={theme.text} letterSpacing="-1px">
                Knowledge Hub
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color={theme.textSecondary} maxW="600px">
                Learn more about HashioDAO and decentralized governance on Hedera
              </Text>
            </VStack>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
              {[
                {
                  title: "HashioDAO Overview",
                  description: "Learn about HashioDAO and its features on the official Hashgraph website.",
                  icon: "🏛️",
                  gradient: "linear(to-br, #7E22CE, #4C1D95)",
                  url: "https://www.hashgraph.com/hashiodao/",
                },
                {
                  title: "HashioDAO Documentation",
                  description: "Technical documentation and guides for building with HashioDAO.",
                  icon: "📚",
                  gradient: "linear(to-br, #6366F1, #4338CA)",
                  url: "https://docs.hedera.com/hedera/open-source-solutions/hashiodao",
                },
                {
                  title: "What is a DAO?",
                  description: "Understand Decentralized Autonomous Organizations and how they work.",
                  icon: "🔍",
                  gradient: "linear(to-br, #EC4899, #BE185D)",
                  url: "https://hedera.com/learning/decentralized-finance/decentralized-autonomous-organization",
                },
                {
                  title: "How to Start a DAO",
                  description: "Step-by-step guide to launching your own decentralized organization.",
                  icon: "🚀",
                  gradient: "linear(to-br, #F59E0B, #D97706)",
                  url: "https://hedera.com/learning/decentralized-finance/how-to-start-a-dao",
                },
              ].map((resource, index) => (
                <Box
                  key={index}
                  as="a"
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  p={8}
                  borderRadius="24px"
                  bg={theme.bgCard}
                  border={`1px solid ${theme.border}`}
                  transition="all 0.3s"
                  cursor="pointer"
                  _hover={{
                    bg: theme.bgCardHover,
                    borderColor: theme.borderHover,
                    transform: "translateY(-4px)",
                    textDecoration: "none",
                  }}
                >
                  <HStack spacing={4} align="flex-start">
                    <Box
                      w="60px"
                      h="60px"
                      borderRadius="16px"
                      bgGradient={resource.gradient}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="2xl"
                      flexShrink={0}
                    >
                      {resource.icon}
                    </Box>
                    <VStack align="flex-start" spacing={2}>
                      <Text color={theme.text} fontSize="xl" fontWeight="700">
                        {resource.title}
                      </Text>
                      <Text color={theme.textSecondary} lineHeight="1.7">
                        {resource.description}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="900px" px={{ base: 4, md: 8 }}>
          <Box
            p={{ base: 8, md: 16 }}
            borderRadius="32px"
            bg={
              isDark
                ? "linear-gradient(135deg, rgba(126, 34, 206, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)"
                : "linear-gradient(135deg, rgba(126, 34, 206, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)"
            }
            border={`1px solid ${theme.border}`}
            textAlign="center"
            position="relative"
            overflow="hidden"
          >
            {/* Decorative Elements */}
            <Box
              position="absolute"
              top="-50px"
              right="-50px"
              w="200px"
              h="200px"
              borderRadius="full"
              bg={isDark ? "rgba(126, 34, 206, 0.3)" : "rgba(126, 34, 206, 0.15)"}
              filter="blur(60px)"
            />
            <Box
              position="absolute"
              bottom="-50px"
              left="-50px"
              w="200px"
              h="200px"
              borderRadius="full"
              bg={isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.15)"}
              filter="blur(60px)"
            />

            <VStack spacing={6} position="relative" zIndex={1}>
              <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="800" color={theme.text} letterSpacing="-1px">
                Ready to launch your DAO?
              </Heading>
              <Text color={theme.textSecondary} fontSize={{ base: "md", md: "lg" }} maxW="500px">
                Join the future of decentralized governance. Create your first DAO in minutes.
              </Text>
              <Button
                size="lg"
                px={10}
                py={7}
                bg={isDark ? "white" : theme.accent}
                color={isDark ? "#0A0A0F" : "white"}
                fontWeight="700"
                borderRadius="full"
                fontSize="md"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: isDark ? "0 20px 40px rgba(255,255,255,0.2)" : "0 20px 40px rgba(126, 34, 206, 0.3)",
                }}
                transition="all 0.2s"
                onClick={() => navigate(Routes.App)}
              >
                Get Started
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={8} borderTop={`1px solid ${theme.border}`}>
        <Container maxW="1400px" px={{ base: 4, md: 8 }}>
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
            <HStack spacing={2}>
              <Box
                w="28px"
                h="28px"
                borderRadius="8px"
                bg="linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="sm" fontWeight="900" color="white">
                  H
                </Text>
              </Box>
              <Text fontSize="sm" color={theme.textMuted}>
                2025 Hashgraph
              </Text>
            </HStack>
            <HStack spacing={6}>
              <Text
                as="a"
                href="https://www.hashgraph.com/terms-of-service/"
                target="_blank"
                rel="noopener noreferrer"
                fontSize="sm"
                color={theme.textMuted}
                _hover={{ color: theme.text }}
                transition="color 0.2s"
              >
                Terms
              </Text>
              <Text
                as="a"
                href="https://www.hashgraph.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                fontSize="sm"
                color={theme.textMuted}
                _hover={{ color: theme.text }}
                transition="color 0.2s"
              >
                Privacy
              </Text>
              <Text
                as="a"
                href="https://skynet.certik.com/projects/swirlds-labs-dao-as-a-service"
                target="_blank"
                rel="noopener noreferrer"
                fontSize="sm"
                color={theme.textMuted}
                _hover={{ color: theme.text }}
                transition="color 0.2s"
              >
                Audit
              </Text>
              <Text
                as="a"
                href="https://github.com/hashgraph/hedera-accelerator-defi-dex-ui"
                target="_blank"
                rel="noopener noreferrer"
                fontSize="sm"
                color={theme.textMuted}
                _hover={{ color: theme.text }}
                transition="color 0.2s"
              >
                GitHub
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
