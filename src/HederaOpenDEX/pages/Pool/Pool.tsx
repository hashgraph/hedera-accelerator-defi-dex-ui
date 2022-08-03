import React from "react";
import { Box, Center, HStack, VStack, Button, Text, Heading } from "@chakra-ui/react";
import { useHederaService } from "../../../hooks/useHederaService/useHederaService";

const Pool = (): JSX.Element => {
  const { balance, getBalance, getLABTokens, swapTokenAWithB, swapTokenBWithA, addLiquidityToPool } =
    useHederaService();

  return (
    <HStack>
      <Box data-testid="pool-component" bg="rgb(36, 38, 76)" borderRadius="24px" width="100%" padding="1rem">
        <Heading
          as="p"
          size="sm"
          color="white"
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
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              {"Get TokenA<>TokenB Pair Balance"}
            </Button>
            <Text
              width="400px"
              textAlign="center"
            >{`Contract Balance TokenA: ${balance.tokenA} TokenB: ${balance.tokenB}`}</Text>
            <Button
              onClick={swapTokenAWithB}
              data-testid="swap-a-with-b-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              Swap Token A With B
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
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              Swap Token B With A
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
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              {"Add TokenA<>TokenB Liquidity"}
            </Button>
            <Button
              onClick={getLABTokens}
              data-testid="get-L49A-tokens-button"
              size="lg"
              height="48px"
              width="100%"
              border="2px"
              marginTop="0.5rem"
              marginBottom="0.5rem"
              bg="rgba(21, 61, 111, 0.44)"
              color="rgb(80, 144, 234)"
              fontSize="16px"
              fontWeight="500"
            >
              {"Get 100 L49A and L49B Tokens"}
            </Button>

            <Text></Text>
          </VStack>
        </Center>
      </Box>
    </HStack>
  );
};

export { Pool };
