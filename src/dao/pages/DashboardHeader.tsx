import { Button, Flex, HStack, Image, VStack, useBreakpointValue, Badge, Box } from "@chakra-ui/react";
import { useNavigate, Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckRightIcon,
  Color,
  DefaultLogoIcon,
  ExternalLink,
  HashscanData,
  HashScanLink,
  Tag,
  Text,
  useTheme,
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
  const isFromMyDAOs = searchParams.get("from") === "myDAOs";
  const backUrl = isFromMyDAOs ? `/${Routes.App}?filter=myDAOs` : `/${Routes.App}`;
  const backLabel = isFromMyDAOs ? "My DAOs" : "All DAOs";
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;
  const daoSafeIdQueryResults = useFetchContract(safeEVMAddress ?? "");
  const safeId = daoSafeIdQueryResults.data?.data.contract_id;
  const { data: token } = useToken(govTokenId ?? "");
  const showMintNFTButton = type === DAOType.NFT && Number(token?.data.max_supply) > Number(token?.data.total_supply);

  const padding = useBreakpointValue({
    base: "1rem 1rem 0.5rem",
    sm: "1rem 1.5rem 0.5rem",
    md: "1rem 2rem 0.5rem",
    lg: "1rem 3rem 0.5rem",
    xl: "1rem 5rem 0.5rem",
  });

  const direction = useBreakpointValue({ base: "column", lg: "row" }) as "column" | "row";
  const logoSize = useBreakpointValue({ base: "8rem", md: "14rem" });
  const defaultLogoSize = useBreakpointValue({ base: "4rem", md: "6rem" });
  const showFullIds = useBreakpointValue({ base: false, md: true });

  return (
    <Flex bg={theme.bgSecondary} direction="column" padding={padding} borderBottom={`1px solid ${theme.border}`}>
      {/* Back navigation */}
      <Box mb={3}>
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
      <Flex
        bg={theme.bgSecondary}
        direction={direction}
        gap={{ base: 3, lg: 4 }}
        alignItems={{ base: "stretch", lg: "flex-start" }}
      >
        <Flex bg={theme.bgSecondary} direction="column" gap="2" flex="1" minWidth="0">
          <HStack gap={{ base: "0.5rem", md: "0.7rem" }} flexWrap="wrap">
            {logoUrl ? (
              <Image
                boxSize={logoSize}
                objectFit="contain"
                src={logoUrl}
                alt="dao logo"
                fallback={<DefaultLogoIcon boxSize={defaultLogoSize} />}
                flexShrink={0}
              />
            ) : (
              <DefaultLogoIcon boxSize={defaultLogoSize} />
            )}
            <VStack alignItems="flex-start" gap="0.2rem" flex="1" minWidth="0">
              <HStack gap="0.5rem" flexWrap="wrap">
                <Text.H3_Medium fontSize={{ base: "lg", md: "xl" }} isTruncated maxWidth="100%" color={theme.text}>
                  {name}
                </Text.H3_Medium>
                <Tag label={type} />
                {isPrivate && (
                  <Badge bg="#22D3EE" color="white" fontSize="xs" px="2" borderRadius="4px">
                    Private
                  </Badge>
                )}
              </HStack>
              <Flex direction={{ base: "column", md: "row" }} gap={{ base: 1, md: 2 }} flexWrap="wrap">
                <HStack>
                  <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }} color={theme.textSecondary}>
                    DAO ID:
                  </Text.H6_Medium>
                  {daoAccountId && <HashScanLink id={daoAccountId} type={HashscanData.Account} />}
                </HStack>
                {govTokenId && showFullIds ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }} color={theme.textSecondary}>
                      {`${token?.data.symbol} TOKEN:`}
                    </Text.H6_Medium>
                    <HashScanLink id={govTokenId} type={HashscanData.Token} />
                  </HStack>
                ) : undefined}
                {safeId && showFullIds ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }} color={theme.textSecondary}>
                      SAFE ID:
                    </Text.H6_Medium>
                    <HashScanLink id={safeId} type={HashscanData.Account} />
                  </HStack>
                ) : undefined}
                {infoUrl && showFullIds ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }} color={theme.textSecondary}>
                      More Info:
                    </Text.H6_Medium>
                    <ExternalLink to={infoUrl ?? ""}>
                      <Text.P_Small_Semibold_Link>Click here</Text.P_Small_Semibold_Link>
                    </ExternalLink>
                  </HStack>
                ) : undefined}
              </Flex>
            </VStack>
          </HStack>
        </Flex>
        <Flex
          bg={theme.bgSecondary}
          direction="column"
          gap="0.4rem"
          alignItems={{ base: "flex-start", lg: "flex-end" }}
          flexShrink={0}
        >
          <HStack gap={2}>
            {showMintNFTButton && token && <MintNFTModal token={token} handleMintNFT={handleMintNFT} />}
            <Button
              variant="primary"
              size={{ base: "sm", md: "md" }}
              onClick={() => {
                navigate("new-proposal");
              }}
            >
              New Proposal
            </Button>
          </HStack>
          {(isMember || isAdmin) && (
            <Flex direction="row" justifyContent="flex-end" gap="0.2rem" alignItems="center">
              <Text.P_Small_Regular color={theme.textMuted} fontSize={{ base: "xs", md: "sm" }}>
                {isAdmin ? "Admin" : "Member"}
              </Text.P_Small_Regular>
              <CheckRightIcon boxSize="4" color={theme.textMuted} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
