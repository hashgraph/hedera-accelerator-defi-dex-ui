import React, { useCallback } from "react";
import {
  Box,
  Center,
  HStack,
  VStack,
  Button,
  Text,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useHederaService } from "../../../hooks/useHederaService/useHederaService";
import { useHashConnectContext } from "../../../context";

const Pool = (): JSX.Element => {
  const { balance, getBalance, getLABTokens, swapTokenAWithB, swapTokenBWithA, addLiquidityToPool } =
    useHederaService();
  const { walletData } = useHashConnectContext();

  const sendLABTokensToConnectedWallet = useCallback(() => {
    getLABTokens(walletData?.pairedAccounts[0]);
  }, [getLABTokens, walletData?.pairedAccounts]);

  return (
    <HStack>
      <Box data-testid="pool-component" bg="white" borderRadius="24px" width="100%" padding="1rem">
        <Heading
          as="p"
          size="sm"
          color="black"
          paddingLeft="5px"
          paddingTop="0.5rem"
          paddingBottom="0.5rem"
          marginBottom="1rem"
        >
          Pool
        </Heading>
        <Center>
          <VStack>
            <Button
              onClick={getBalance}
              data-testid="get-pair-balance"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="black"
              color="white"
              fontSize="16px"
              fontWeight="500"
            >
              {"Get L49A<>L49B Swap Contract Balances"}
            </Button>
            <TableContainer>
              <Table variant="simple">
                <TableCaption>Swap Contract Token Balances</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Token</Th>
                    <Th>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>L49A</Td>
                    <Td isNumeric>{Number(balance.tokenA)}</Td>
                  </Tr>
                  <Tr>
                    <Td>L49B</Td>
                    <Td isNumeric>{Number(balance.tokenB)}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
            <Button
              onClick={swapTokenAWithB}
              data-testid="swap-a-with-b-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="black"
              color="white"
              fontSize="16px"
              fontWeight="500"
            >
              Swap L49A With L49B
            </Button>
            <Button
              onClick={swapTokenBWithA}
              data-testid="swap-b-with-a-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="black"
              color="white"
              fontSize="16px"
              fontWeight="500"
            >
              Swap L49B With L49A
            </Button>
            <Button
              onClick={addLiquidityToPool}
              data-testid="add-liqidity-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="black"
              color="white"
              fontSize="16px"
              fontWeight="500"
            >
              {"Add L49A<>L49B Liquidity"}
            </Button>
            <Button
              onClick={sendLABTokensToConnectedWallet}
              data-testid="get-L49A-tokens-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="black"
              color="white"
              fontSize="16px"
              fontWeight="500"
            >
              {"Send 100 L49A and L49B To Wallet"}
            </Button>

            <Text></Text>
          </VStack>
        </Center>
      </Box>
    </HStack>
  );
};

export { Pool };
