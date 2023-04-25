import { Text, Flex, HStack, Tag } from "@chakra-ui/react";
import { Link as ReachLink } from "react-router-dom";
import { Button, Breadcrumb, ArrowLeftIcon, Color, HashScanLink, HashscanData } from "@dex-ui-components";
import { DexService, DAOType } from "@services";
import { useDexContext } from "@hooks";

/**
 * TODO: For demo and testing purposes only. Remove this constant once the send transcation flow
 * is implemented.
 */
const LAB49_TOKEN = "0.0.8579";

interface DashboardHeaderProps {
  daoAccountId: string;
  safeAccountId: string;
  name: string;
  type: DAOType;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();
  const { daoAccountId, safeAccountId, name, type } = props;

  /**
   * TODO: For demo and testing purposes only. Remove this function and replace with a proper UI flow.
   */
  function handleClickSendTransaction() {
    DexService.sendProposeTransferTransaction({
      tokenId: LAB49_TOKEN,
      receiverId: safeAccountId,
      amount: 1,
      decimals: 8,
      multiSigDAOContractId: daoAccountId,
      signer,
    });
  }

  return (
    <Flex bg={Color.White_02} direction="column" padding="24px 80px 16px">
      <Flex bg={Color.White_02} direction="row" gap="4">
        <Flex bg={Color.White_02} direction="column" gap="2">
          <HStack>
            <Text textStyle="h3 medium">{name}</Text>
            <Tag textStyle="p small medium" color={Color.Grey_Blue._500}>
              {type}
            </Tag>
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
        </Flex>
        <Flex bg={Color.White_02} flexGrow="1" justifyContent="right" gap="8">
          <Flex height="40px" alignItems="center">
            <Breadcrumb to="/daos" as={ReachLink} label="Back to DAOs" leftIcon={<ArrowLeftIcon />} />
          </Flex>
          <Button variant="primary" onClick={handleClickSendTransaction}>
            {"Send Transaction (Test with 1 LAB49 Token)"}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
