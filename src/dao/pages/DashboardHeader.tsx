import {
  Button,
  Flex,
  HStack,
  Image,
  VStack,
  useBreakpointValue,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  Color,
  DefaultLogoIcon,
  ExternalLink,
  HashscanData,
  HashScanLink,
  Text,
  useTheme,
  useThemeMode,
} from "@shared/ui-kit";
import { DAOType } from "@dao/services";
import { MintNFTModal } from "./MintNFTModal";
import { useToken } from "@dex/hooks";
import { Routes } from "@dao/routes";
import { useFetchContract } from "@dao/hooks";

interface DashboardHeaderProps {
  isMember?: boolean;
  isAdmin?: boolean;
  accountEVMAddress: string;
  govTokenId?: string;
  safeEVMAddress?: string;
  name: string;
  type: DAOType;
  logoUrl?: string;
  infoUrl?: string;
  isPrivate?: boolean;
  handleMintNFT?: (tokenLinks: string[]) => void;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const {
    accountEVMAddress,
    name,
    type,
    logoUrl,
    govTokenId,
    safeEVMAddress,
    isMember,
    isAdmin,
    infoUrl,
    isPrivate,
    handleMintNFT,
  } = props;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const isFromMyDAOs = searchParams.get("from") === "myDAOs";
  const backUrl = isFromMyDAOs ? `/${Routes.App}?filter=myDAOs` : `/${Routes.App}`;
  const backLabel = isFromMyDAOs ? "My DAOs" : "All DAOs";
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;
  const daoSafeIdQueryResults = useFetchContract(safeEVMAddress ?? "");
  const safeId = daoSafeIdQueryResults.data?.data.contract_id;
  const { data: token } = useToken(govTokenId ?? "");
  const showMintNFTButton = type === DAOType.NFT && Number(token?.data.max_supply) > Number(token?.data.total_supply);
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();

  const padding = useBreakpointValue({
    base: "1rem",
    sm: "1rem 1.5rem",
    md: "1.5rem 2rem",
    lg: "1.5rem 3rem",
    xl: "1.5rem 5rem",
  });

  const logoSize = useBreakpointValue({ base: "80px", md: "120px" });
  const showFullIds = useBreakpointValue({ base: false, md: true });

  // Card styling similar to landing page
  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(30,30,40,0.9) 0%, rgba(20,20,28,0.95) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)";

  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${theme.border}`;

  return (
    <Box bg={theme.bg} padding={padding}>
      {/* Back navigation */}
      <Box mb={4}>
        <HStack
          as={RouterLink}
          to={backUrl}
          spacing={2}
          fontSize="sm"
          fontWeight="500"
          _hover={{ "& p": { color: Color.Primary._500 } }}
          transition="all 0.2s"
          width="fit-content"
        >
          <ArrowLeftIcon fill={theme.textSecondary} options={{ boxSize: "0.6rem" }} />
          <Text.P_Small_Medium color={theme.textSecondary}>{backLabel}</Text.P_Small_Medium>
        </HStack>
      </Box>

      {/* Main Card */}
      <Box
        bg={cardBg}
        border={cardBorder}
        borderRadius="24px"
        p={{ base: 4, md: 6 }}
        backdropFilter="blur(20px)"
        boxShadow={isDark ? "0 10px 40px rgba(0,0,0,0.3)" : "0 10px 40px rgba(126, 34, 206, 0.08)"}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 4, lg: 6 }}
          align={{ base: "stretch", lg: "center" }}
        >
          {/* Left: DAO Identity */}
          <Flex align="center" gap={4} flex="1" minW={0}>
            {/* Logo */}
            <Box flexShrink={0}>
              {logoUrl ? (
                <Image
                  boxSize={logoSize}
                  objectFit="cover"
                  src={logoUrl}
                  alt="dao logo"
                  borderRadius="16px"
                  cursor="pointer"
                  onClick={onImageOpen}
                  transition="transform 0.2s"
                  _hover={{ transform: "scale(1.05)" }}
                  fallback={<DefaultLogoIcon boxSize={logoSize} />}
                />
              ) : (
                <DefaultLogoIcon boxSize={logoSize} />
              )}
            </Box>

            {/* Image Modal */}
            <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl" isCentered>
              <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
              <ModalContent bg="transparent" boxShadow="none" maxW="90vw" maxH="90vh">
                <ModalCloseButton
                  color="white"
                  bg="blackAlpha.600"
                  borderRadius="full"
                  _hover={{ bg: "blackAlpha.800" }}
                  size="lg"
                  top={-2}
                  right={-2}
                />
                <Image src={logoUrl} alt="dao logo" maxW="90vw" maxH="85vh" objectFit="contain" borderRadius="16px" />
              </ModalContent>
            </Modal>

            {/* Name & Info */}
            <VStack align="start" spacing={1} flex="1" minW={0}>
              <HStack spacing={2} flexWrap="wrap">
                <Text.H3_Medium fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color={theme.text} isTruncated>
                  {name}
                </Text.H3_Medium>
                <Box
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={isDark ? "rgba(126, 34, 206, 0.2)" : "rgba(126, 34, 206, 0.1)"}
                  border="1px solid rgba(126, 34, 206, 0.3)"
                >
                  <Text.P_XSmall_Medium color={Color.Primary._500} fontWeight="600">
                    {type}
                  </Text.P_XSmall_Medium>
                </Box>
                {isPrivate && (
                  <Box
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="rgba(34, 211, 238, 0.15)"
                    border="1px solid rgba(34, 211, 238, 0.3)"
                  >
                    <Text.P_XSmall_Medium color="#22D3EE" fontWeight="600">
                      Private
                    </Text.P_XSmall_Medium>
                  </Box>
                )}
                {(isMember || isAdmin) && (
                  <Box
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="rgba(74, 222, 128, 0.15)"
                    border="1px solid rgba(74, 222, 128, 0.3)"
                  >
                    <Text.P_XSmall_Medium color="#4ADE80" fontWeight="600">
                      {isAdmin ? "Admin" : "Member"}
                    </Text.P_XSmall_Medium>
                  </Box>
                )}
              </HStack>

              {/* IDs Row */}
              <Flex gap={{ base: 2, md: 4 }} flexWrap="wrap" align="center">
                {daoAccountId && (
                  <HStack spacing={1}>
                    <Text.P_XSmall_Regular color={theme.textMuted}>DAO:</Text.P_XSmall_Regular>
                    <HashScanLink id={daoAccountId} type={HashscanData.Account} />
                  </HStack>
                )}
                {govTokenId && showFullIds && (
                  <HStack spacing={1}>
                    <Text.P_XSmall_Regular color={theme.textMuted}>{token?.data.symbol}:</Text.P_XSmall_Regular>
                    <HashScanLink id={govTokenId} type={HashscanData.Token} />
                  </HStack>
                )}
                {safeId && showFullIds && (
                  <HStack spacing={1}>
                    <Text.P_XSmall_Regular color={theme.textMuted}>Safe:</Text.P_XSmall_Regular>
                    <HashScanLink id={safeId} type={HashscanData.Account} />
                  </HStack>
                )}
                {infoUrl && showFullIds && (
                  <ExternalLink to={infoUrl}>
                    <Text.P_XSmall_Semibold color={Color.Primary._500} _hover={{ textDecoration: "underline" }}>
                      More Info
                    </Text.P_XSmall_Semibold>
                  </ExternalLink>
                )}
              </Flex>
            </VStack>
          </Flex>

          {/* Right: Actions */}
          <HStack spacing={3} flexShrink={0}>
            {showMintNFTButton && token && <MintNFTModal token={token} handleMintNFT={handleMintNFT} />}
            <Button
              px={6}
              py={5}
              bg="linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)"
              color="white"
              fontWeight="600"
              borderRadius="full"
              fontSize="sm"
              _hover={{
                transform: "scale(1.02)",
                boxShadow: "0 0 30px rgba(126, 34, 206, 0.4)",
              }}
              transition="all 0.2s"
              onClick={() => navigate("new-proposal")}
            >
              New Proposal
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
