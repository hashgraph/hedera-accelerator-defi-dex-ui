import { Flex, HStack, Button, Image, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  Text,
  Breadcrumb,
  Color,
  HashScanLink,
  HashscanData,
  Tag,
  DefaultLogoIcon,
  CheckRightIcon,
  ExternalLink,
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
    handleMintNFT,
  } = props;
  const navigate = useNavigate();
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;
  const daoSafeIdQueryResults = useFetchContract(safeEVMAddress ?? "");
  const safeId = daoSafeIdQueryResults.data?.data.contract_id;
  const { data: token } = useToken(govTokenId ?? "");
  const showMintNFTButton = type === DAOType.NFT && Number(token?.data.max_supply) > Number(token?.data.total_supply);

  return (
    <Flex bg={Color.White} direction="column" padding="1rem 5rem 0.5rem">
      <Flex bg={Color.White} direction="row" gap="4">
        <Flex bg={Color.White} direction="column" gap="2">
          <HStack gap="0.7rem">
            <Image
              boxSize="3.5rem"
              objectFit="contain"
              src={logoUrl}
              alt="dao logo"
              fallback={<DefaultLogoIcon boxSize="3.5rem" color={Color.Grey_Blue._100} />}
            />
            <VStack alignItems="flex-start" gap="0.2rem">
              <HStack gap="0.7rem">
                <Text.H3_Medium>{name}</Text.H3_Medium>
                <Tag label={type} />
              </HStack>
              <HStack>
                <HStack>
                  <Text.H6_Medium opacity="0.8">DAO ID:</Text.H6_Medium>
                  {daoAccountId && <HashScanLink id={daoAccountId} type={HashscanData.Account} />}
                </HStack>
                {govTokenId ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8">{`${token?.data.symbol} TOKEN ID:`}</Text.H6_Medium>
                    <HashScanLink id={govTokenId} type={HashscanData.Token} />
                  </HStack>
                ) : undefined}
                {safeId ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8">SAFE ID:</Text.H6_Medium>
                    <HashScanLink id={safeId} type={HashscanData.Account} />
                  </HStack>
                ) : undefined}
                {infoUrl ? (
                  <HStack>
                    <Text.H6_Medium opacity="0.8">For More Info:</Text.H6_Medium>
                    <ExternalLink to={infoUrl ?? ""}>
                      <Text.P_Small_Semibold_Link>Click here</Text.P_Small_Semibold_Link>
                    </ExternalLink>
                  </HStack>
                ) : undefined}
              </HStack>
            </VStack>
          </HStack>
        </Flex>
        <Flex bg={Color.White_02} flexGrow="1" justifyContent="right" gap="8">
          <Flex height="40px" alignItems="center">
            <Breadcrumb to={Routes.Home} label="Back to DAOs" />
          </Flex>
          {showMintNFTButton && token && (
            <Flex height="40px" alignItems="center">
              <MintNFTModal token={token} handleMintNFT={handleMintNFT} />
            </Flex>
          )}
          <Flex direction="column" gap="0.6rem">
            <Button
              variant="primary"
              onClick={() => {
                navigate("new-proposal");
              }}
            >
              New Proposal
            </Button>
            {isMember || isAdmin ? (
              <Flex direction="row" justifyContent="right" gap="0.2rem" alignItems="center">
                <Text.P_Small_Regular color={Color.Neutral._500}>{isAdmin ? "Admin" : "Member"}</Text.P_Small_Regular>
                <CheckRightIcon boxSize="4" color={Color.Neutral._500} />
              </Flex>
            ) : undefined}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
