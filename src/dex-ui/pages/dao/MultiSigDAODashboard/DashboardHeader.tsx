import { Text, Flex, HStack, Button, Image, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Color, HashScanLink, HashscanData, Tag, DefaultLogoIcon } from "@dex-ui-components";
import { DAOType } from "@services";
import { Paths } from "@routes";

interface DashboardHeaderProps {
  daoAccountId: string;
  safeAccountId: string;
  name: string;
  type: DAOType;
  logoUrl: string;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const { daoAccountId, safeAccountId, name, type, logoUrl } = props;
  const navigate = useNavigate();

  function handleNewProposalClicked() {
    navigate(Paths.DAOs.CreateDAOProposal);
  }

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
                <HStack>
                  <Text textStyle="h4" opacity="0.8">
                    SAFE ID:
                  </Text>
                  <HashScanLink id={safeAccountId} type={HashscanData.Account} />
                </HStack>
              </HStack>
            </VStack>
          </HStack>
        </Flex>
        <Flex bg={Color.White_02} flexGrow="1" justifyContent="right" gap="8">
          <Flex height="40px" alignItems="center">
            <Breadcrumb to="/daos" label="Back to DAOs" />
          </Flex>
          <Button variant="primary" onClick={handleNewProposalClicked}>
            New Proposal
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
