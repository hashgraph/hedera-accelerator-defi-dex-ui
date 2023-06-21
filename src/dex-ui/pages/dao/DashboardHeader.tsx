import { Text, Flex, HStack, Button, Image, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  Color,
  HashScanLink,
  HashscanData,
  Tag,
  DefaultLogoIcon,
  CheckRightIcon,
} from "@dex-ui-components";
import { DAOType } from "@services";

interface DashboardHeaderProps {
  isMember?: boolean;
  isAdmin?: boolean;
  daoAccountId: string;
  govTokenId?: string;
  safeId?: string;
  name: string;
  type: DAOType;
  logoUrl?: string;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const { daoAccountId, name, type, logoUrl, govTokenId, safeId, isMember, isAdmin } = props;
  const navigate = useNavigate();

  return (
    <Flex bg={Color.White_02} direction="column" padding="24px 80px 16px">
      <Flex bg={Color.White_02} direction="row" gap="4">
        <Flex bg={Color.White_02} direction="column" gap="2">
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
                <Text textStyle="h3 medium">{name}</Text>
                <Tag label={type} />
              </HStack>
              <HStack>
                <HStack>
                  <Text textStyle="h4" opacity="0.8">
                    DAO ID:
                  </Text>
                  <HashScanLink id={daoAccountId} type={HashscanData.Account} />
                </HStack>
                {govTokenId ? (
                  <HStack>
                    <Text textStyle="h4" opacity="0.8">
                      GOV TOKEN ID:
                    </Text>
                    <HashScanLink id={govTokenId} type={HashscanData.Token} />
                  </HStack>
                ) : undefined}
                {safeId ? (
                  <HStack>
                    <Text textStyle="h4" opacity="0.8">
                      SAFE ID:
                    </Text>
                    <HashScanLink id={safeId} type={HashscanData.Account} />
                  </HStack>
                ) : undefined}
              </HStack>
            </VStack>
          </HStack>
        </Flex>
        <Flex bg={Color.White_02} flexGrow="1" justifyContent="right" gap="8">
          <Flex height="40px" alignItems="center">
            <Breadcrumb to="/daos" label="Back to DAOs" />
          </Flex>
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
                <Text textStyle="p small regular" color={Color.Neutral._500}>
                  {isMember ? "Member" : "Admin"}
                </Text>
                <CheckRightIcon boxSize="4" color={Color.Neutral._500} />
              </Flex>
            ) : undefined}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
