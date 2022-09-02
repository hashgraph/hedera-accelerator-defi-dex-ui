import React, { ChangeEvent, useCallback, useReducer, useState } from "react";
import {
  Box,
  Center,
  HStack,
  VStack,
  Button,
  Text,
  Heading,
  Flex,
  IconButton,
  Spacer,
} from "@chakra-ui/react";
import { useHederaService } from "../../../hooks/useHederaService/useHederaService";
import { useHashConnectContext } from "../../../context";
import { ContractId, TokenId } from "@hashgraph/sdk";
import { TokenAmountInput, TokenSelector } from "../../../components";
import { ActionType, initialPoolState, initPoolReducer, poolReducer } from "./reducers";
import { UpDownIcon } from "@chakra-ui/icons";
import { pairCurrentPosition } from "../../../hooks/useHederaService/swapContract";

const Pool = (): JSX.Element => {
  const tokenSymbolToAccountID = new Map<string, string>([
    ["L49A", "0.0.47646195"],
    ["L49B", "0.0.47646196"],
  ]);
  const {
    balance,
    getBalance,
    getLABTokens,
    swapTokenAWithB,
    swapTokenBWithA,
    // addLiquidityToPool // TODO: clean this up? or do we want the addLiquidityToPool logic to live in HederaService?
  } = useHederaService();
  const { walletData, sendAddLiquidityTransaction } = useHashConnectContext();

  useCallback(() => {
    const tokenBalances = walletData?.pairedAccountBalance?.tokens;
    console.log('tokenBalances', tokenBalances);
  }, [walletData])

  const [poolState, dispatch] = useReducer(poolReducer, initialPoolState, initPoolReducer);
  const { inputToken, outputToken } = poolState;

  const [localPoolState, setPoolState] = useState({
    poolBalances: {
      L49A: {
        amount: 0,
        address: "0.0.47646195",
        spotPrice: 0,
        exchangeRate: 0,
      },
      L49B: {
        amount: 0,
        address: "0.0.47646196",
        spotPrice: 0,
        exchangeRate: 0
      }
    },
    selectedToken: '',
    firstInputVal: 0,
    secondInputVal: 0,
    hasAddedLiquidity: false,
  });

  const onAddLiquidityClick = useCallback(() => {
    if (!localPoolState.hasAddedLiquidity) setPoolState({ ...localPoolState, hasAddedLiquidity: true });
    sendAddLiquidityTransaction({
      // TODO: add input fields and logic to make this dynamic. testing signer for now
      firstTokenAddr: poolState.inputToken.address,
      firstTokenQty: poolState.inputToken.amount,
      secondTokenAddr: poolState.outputToken.address,
      secondTokenQty: poolState.outputToken.amount,
      // addLiquidityContractAddr: ContractId.fromString("0.0.47712695"),
      addLiquidityContractAddr: ContractId.fromString("0.0.48143542"),
    });
  }, [poolState]);

  const handlePoolInputsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement> | string | undefined, actionType: ActionType, field: string) => {
      const inputElement = typeof (event) === 'string' ? { value: event } : event?.target as HTMLInputElement;
      // calculate the other token amount
      dispatch({ type: actionType, field, payload: inputElement.value });
    }, []);

  const handleInputAmountChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    console.log(event);
    handlePoolInputsChange(event, ActionType.UPDATE_INPUT_TOKEN, "amount");
  }, [handlePoolInputsChange]);

  const handleInputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_INPUT_TOKEN, "symbol");
      handlePoolInputsChange(
        tokenSymbolToAccountID.get(event.target.value),
        ActionType.UPDATE_INPUT_TOKEN,
        "address"
      );
      setPoolState({
        ...localPoolState,
        selectedToken: event.target.value,
      });
    },
    [handlePoolInputsChange]
  );

  const getPortionOfBalance = (field: 'inputToken' | 'outputToken', _portion: 'half' | 'max') => {
    const selectedToken = field === 'inputToken' ? poolState.inputToken.symbol : poolState.outputToken.symbol;
    const tokenBalance = getBalanceByTokenSymbol(selectedToken);
    // TODO: remove Math.floor when we are able to handle fractional values
    const portion = _portion === 'half' ? Math.floor(tokenBalance / 2) : Math.floor(tokenBalance);
    handlePoolInputsChange(
      portion.toString(),
      field === 'inputToken' ? ActionType.UPDATE_INPUT_TOKEN : ActionType.UPDATE_OUTPUT_TOKEN,
      "amount"
    );
  }

  const getBalanceByTokenSymbol = useCallback(
    (tokenSymbol: string): number => {
      console.log(tokenSymbol);
      const tokenBalances = walletData?.pairedAccountBalance?.tokens;
      console.log(walletData.pairedAccountBalance.tokens);
      console.log(tokenBalances);
      const tokenId = tokenSymbolToAccountID.get(tokenSymbol);
      return tokenBalances?.find((tokenData: any) => tokenData.tokenId === tokenId)?.balance;
    }, [walletData]
  );

  const handleOutputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_OUTPUT_TOKEN, "amount");
    },
    [handlePoolInputsChange]
  );

  const handleOutputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_OUTPUT_TOKEN, "symbol");
      handlePoolInputsChange(
        tokenSymbolToAccountID.get(event.target.value),
        ActionType.UPDATE_OUTPUT_TOKEN,
        "address"
      );
    },
    [handlePoolInputsChange]
  );

  const swapTokens = useCallback(() => {
    setPoolState({
      ...localPoolState,
      // selectedToken: !localPoolState.selectedToken ? '' : localPoolState.selectedToken === 'L49A' ? 'l49B' : 'l49A'
    });
    dispatch({ type: ActionType.SWITCH_INPUT_AND_OUTPUT_TOKEN });
  }, [dispatch]);

  const getExchangeRatio = useCallback(() => {
    const selectedToken = localPoolState.selectedToken.toString()
    return selectedToken ?
      selectedToken === 'L49A' ?
        localPoolState.poolBalances.L49A.exchangeRate :
        localPoolState.poolBalances.L49B.exchangeRate :
      '-';
  }, [localPoolState])

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
            <Box border="1px solid black" borderRadius="5px" backgroundColor="#F2F2F2">
              <Flex>
                <Box flex="5">
                  <TokenAmountInput
                    data-testid="swap-input"
                    value={poolState?.inputToken?.amount}
                    onChangeHandler={handleInputAmountChange}
                    variant="token-amount-input"
                  />
                </Box>
                <Box flex="4">
                  <TokenSelector value={inputToken?.symbol} onChangeHandler={handleInputSymbolChange} />
                </Box>
              </Flex>
              <Flex backgroundColor="#F2F2F2">
                <Text fontSize="xs" padding="0.25rem" fontWeight="bold">
                  Balance: {getBalanceByTokenSymbol(inputToken?.symbol ?? "") || "Connect to View"}
                </Text>
                <Button variant="xs-text" onClick={() => getPortionOfBalance('inputToken', 'half')}>Half</Button>
                <Button variant="xs-text" onClick={() => getPortionOfBalance('inputToken', 'max')}>Max</Button>
              </Flex>
            </Box>
            <Flex>
              <Spacer />
              <IconButton
                data-testid="switch-token-inputs-button"
                aria-label="Switch the token amount and symbol input values."
                icon={<UpDownIcon w={6} h={6} />}
                onClick={swapTokens}
                isRound={true}
                variant="switch-token-inputs"
              />
              <Spacer />
            </Flex>
            <Box border="1px solid black" borderRadius="5px" backgroundColor="#F2F2F2">
              <Flex>
                <Box flex="5">
                  <TokenAmountInput
                    data-testid="swap-output"
                    value={poolState?.outputToken?.amount}
                    onChangeHandler={handleOutputAmountChange}
                    variant="token-amount-input"
                  />
                </Box>
                <Box flex="4">
                  <TokenSelector value={outputToken?.symbol} onChangeHandler={handleOutputSymbolChange} />
                </Box>
              </Flex>
              <Flex backgroundColor="#F2F2F2">
                <Text fontSize="xs" padding="0.25rem" fontWeight="bold">
                  Balance: {getBalanceByTokenSymbol(outputToken?.symbol ?? "") || "Connect to View"}
                </Text>
                <Button variant="xs-text" onClick={() => getPortionOfBalance('outputToken', 'half')}>Half</Button>
                <Button variant="xs-text" onClick={() => getPortionOfBalance('outputToken', 'max')}>Max</Button>
              </Flex>
            </Box>
            <Flex justifyContent={"space-between"} width={"100%"}>
              <Flex flexDirection={"column"}>
                <Text fontSize="xs" padding="0.1rem" fontWeight="bold">
                  Transaction Fee
                </Text>
                <Text fontSize="xs" padding="0.1rem" fontWeight="bold">
                  0.0
                </Text>
              </Flex>
              <Flex flexDirection={"column"}>
                <Text fontSize="xs" padding="0.1rem" fontWeight="bold">
                  Share of Pool
                </Text>
                <Text fontSize="xs" padding="0.1rem" fontWeight="bold">
                  {localPoolState.hasAddedLiquidity ? '<0.1%' : '0.00%'}
                </Text>
              </Flex>
              <Flex flexDirection={"column"}>
                <Text fontSize="xs" padding="0.1rem" fontWeight="bold">
                  Pool Exchange Ratio
                </Text>
                <Text fontSize="xs" padding="0.1rem" fontWeight="bold">
                  {getExchangeRatio()}
                </Text>
              </Flex>
            </Flex>
            <Button
              onClick={onAddLiquidityClick}
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
              {"Add to Pool"}
            </Button>
            {/* <Button
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
            </Button> */}

            <Text></Text>
          </VStack>
        </Center>
      </Box>
    </HStack>
  );
};

export { Pool };
