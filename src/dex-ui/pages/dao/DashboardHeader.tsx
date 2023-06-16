import { Text, Flex, HStack, Button, Image, VStack } from "@chakra-ui/react";
import { Link as ReachLink, useNavigate } from "react-router-dom";
import { Breadcrumb, ArrowLeftIcon, Color, HashScanLink, HashscanData, Tag, DefaultLogoIcon } from "@dex-ui-components";
import { DAOType } from "@services";

interface DashboardHeaderProps {
  daoAccountId: string;
  govTokenId?: string;
  safeId?: string;
  name: string;
  type: DAOType;
  logoUrl?: string;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const { daoAccountId, name, type, logoUrl, govTokenId, safeId } = props;
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
            <Breadcrumb to="/daos" as={ReachLink} label="Back to DAOs" leftIcon={<ArrowLeftIcon />} />
          </Flex>
          <Button
            variant="primary"
            onClick={() => {
              navigate("new-proposal");
            }}
          >
            New Proposal
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
