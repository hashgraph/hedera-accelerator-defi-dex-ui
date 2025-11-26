import { Button, Flex, HStack, Image, VStack, useBreakpointValue, Badge, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  CheckRightIcon,
  Color,
  DefaultLogoIcon,
  ExternalLink,
  HashscanData,
  HashScanLink,
  Tag,
  Text,
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
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;
  const daoSafeIdQueryResults = useFetchContract(safeEVMAddress ?? "");
  const safeId = daoSafeIdQueryResults.data?.data.contract_id;
  const { data: token } = useToken(govTokenId ?? "");
  const showMintNFTButton = type === DAOType.NFT && Number(token?.data.max_supply) > Number(token?.data.total_supply);
  const colorBG = isPrivate ? Color.Private.Bg : Color.White;

  const padding = useBreakpointValue({
    base: "1rem 1rem 0.5rem",
    sm: "1rem 1.5rem 0.5rem",
    md: "1rem 2rem 0.5rem",
    lg: "1rem 3rem 0.5rem",
    xl: "1rem 5rem 0.5rem",
  });

  const direction = useBreakpointValue({ base: "column", lg: "row" }) as "column" | "row";
  const logoSize = useBreakpointValue({ base: "2.5rem", md: "3.5rem" });
  const showFullIds = useBreakpointValue({ base: false, md: true });

  return (
    <Flex bg={colorBG} direction="column" padding={padding}>
      <Flex
        bg={colorBG}
        direction={direction}
        gap={{ base: 3, lg: 4 }}
        alignItems={{ base: "stretch", lg: "flex-start" }}
      >
        <Flex bg={colorBG} direction="column" gap="2" flex="1" minWidth="0">
          <HStack gap={{ base: "0.5rem", md: "0.7rem" }} flexWrap="wrap">
            <Image
              boxSize={logoSize}
              objectFit="contain"
              src={logoUrl}
              alt="dao logo"
              fallback={<DefaultLogoIcon boxSize={logoSize} color={Color.Grey_Blue._100} />}
              flexShrink={0}
            />
            <VStack alignItems="flex-start" gap="0.2rem" flex="1" minWidth="0">
              <HStack gap="0.5rem" flexWrap="wrap">
                <Text.H3_Medium fontSize={{ base: "lg", md: "xl" }} isTruncated maxWidth="100%">
                  {name}
                </Text.H3_Medium>
                <Tag label={type} />
                {isPrivate && (
                  <Badge bg={Color.Private.Accent} color="white" fontSize="xs" px="2" borderRadius="4px">
                    Private
                  </Badge>
                )}
              </HStack>
              <Flex direction={{ base: "column", md: "row" }} gap={{ base: 1, md: 2 }} flexWrap="wrap">
                <HStack>
                  <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }}>
                    DAO ID:
                  </Text.H6_Medium>
                  {daoAccountId && <HashScanLink id={daoAccountId} type={HashscanData.Account} />}
                </HStack>
                {govTokenId && showFullIds ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }}>
                      {`${token?.data.symbol} TOKEN:`}
                    </Text.H6_Medium>
                    <HashScanLink id={govTokenId} type={HashscanData.Token} />
                  </HStack>
                ) : undefined}
                {safeId && showFullIds ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }}>
                      SAFE ID:
                    </Text.H6_Medium>
                    <HashScanLink id={safeId} type={HashscanData.Account} />
                  </HStack>
                ) : undefined}
                {infoUrl && showFullIds ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8" fontSize={{ base: "xs", md: "sm" }}>
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
          bg={colorBG}
          direction={{ base: "row", lg: "row" }}
          justifyContent={{ base: "space-between", lg: "flex-end" }}
          alignItems="center"
          gap={{ base: 2, md: 4, lg: 8 }}
          flexWrap="wrap"
          flexShrink={0}
        >
          <Box display={{ base: "block", lg: "block" }}>
            <Breadcrumb to={Routes.Home} label="Back to DAOs" />
          </Box>
          {showMintNFTButton && token && (
            <Box>
              <MintNFTModal token={token} handleMintNFT={handleMintNFT} />
            </Box>
          )}
          <Flex direction="column" gap="0.4rem" alignItems={{ base: "flex-end", lg: "flex-end" }}>
            <Button
              variant="primary"
              size={{ base: "sm", md: "md" }}
              onClick={() => {
                navigate("new-proposal");
              }}
            >
              New Proposal
            </Button>
            {(isMember || isAdmin) && (
              <Flex direction="row" justifyContent="flex-end" gap="0.2rem" alignItems="center">
                <Text.P_Small_Regular color={Color.Neutral._500} fontSize={{ base: "xs", md: "sm" }}>
                  {isAdmin ? "Admin" : "Member"}
                </Text.P_Small_Regular>
                <CheckRightIcon boxSize="4" color={Color.Neutral._500} />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
