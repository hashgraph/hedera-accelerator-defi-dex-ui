import { Text, Flex, HStack, Button, Image } from "@chakra-ui/react";
import { Link as ReachLink, useNavigate } from "react-router-dom";
import { Breadcrumb, ArrowLeftIcon, Color, HashScanLink, HashscanData, Tag } from "@dex-ui-components";
import { DAOType } from "@services";
import { isValidUrl } from "@utils";

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
        {isValidUrl(logoUrl) ? (
          <Image src={logoUrl} boxSize="64px" objectFit="cover" alt="Logo Url" marginRight="0.5rem" />
        ) : undefined}
        <Flex bg={Color.White_02} direction="column" gap="2">
          <HStack>
            <Text textStyle="h3 medium">{name}</Text>
            <Tag label={`${type} DAO`} />
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
