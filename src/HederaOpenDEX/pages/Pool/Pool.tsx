import React, { ChangeEvent, useCallback, useEffect, useReducer } from "react";
import { Box, Center, HStack, VStack, Button, Text, Heading, Flex, IconButton, Spacer } from "@chakra-ui/react";
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
  const { getLABTokens } = useHederaService();  // TODO: remove
  const { walletData, sendAddLiquidityTransaction, spotPrices } = useHashConnectContext();

  useCallback(() => {
    const tokenBalances = walletData?.pairedAccountBalance?.tokens;
    console.log("tokenBalances", tokenBalances);
  }, [walletData]);

  const [poolState, dispatch] = useReducer(poolReducer, initialPoolState, initPoolReducer);
  const { inputToken, outputToken } = poolState;

  /**
   * Helper function that will dispatch action to update details about tokens in either input depending on
   * which params are passed to it
   * @param event either the HTML event from the form field (input, dropdown/select) that was interacted with
   *              or a string that contains the desired value to be sent in the payload of the action
   * @param actionType action type corresponding to which token's store slice should be updated
   *                   (UPDATED_INPUT_TOKEN or UPDATED_OUTPUT_TOKEN)
   * @param field the specific field within the specified token's store slice that should be updated
   */
  const handlePoolInputsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement> | string | undefined, actionType: ActionType, field: string) => {
      const inputElement = typeof event === "string" ? { value: event } : (event?.target as HTMLInputElement);
      dispatch({ type: actionType, field, payload: inputElement.value });
    },
    []
  );

  /**
   * Call sendAddLiquidityTransaction prop with token addresses/quantity and
   * add liquidity contract address as parameters. Invoked on click of "Add to Pool"
   */
  const onAddLiquidityClick = useCallback(() => {
    sendAddLiquidityTransaction({
      firstTokenAddr: poolState.inputToken.address,
      firstTokenQty: poolState.inputToken.amount,
      secondTokenAddr: poolState.outputToken.address,
      secondTokenQty: poolState.outputToken.amount,
      addLiquidityContractAddr: ContractId.fromString("0.0.48143542"),
    });
  }, [poolState, sendAddLiquidityTransaction]);

  /**
   * Whenever there is a change in the selected token in either input field or change in
   * spot prices, retrieve the spot price and dispatch action to update state slices for
   * spot price for each token accordingly
   */
  useEffect(() => {
    const firstTokenSymbol = poolState.inputToken.symbol;
    const secondTokenSymbol = poolState.outputToken.symbol;

    if (firstTokenSymbol && secondTokenSymbol) {
      console.log("setting spot price");
      console.log("spot price A", spotPrices?.get("L49A=>L49B"));
      console.log("spot price B", spotPrices?.get("L49B=>L49A"));
      const firstTokenSpotPrice = spotPrices?.get(`${firstTokenSymbol}=>${secondTokenSymbol}`) || 0;
      const secondTokenSpotPrice = spotPrices?.get(`${secondTokenSymbol}=>${firstTokenSymbol}`) || 0;
      dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "spotPrice", payload: firstTokenSpotPrice });
      dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "spotPrice", payload: secondTokenSpotPrice });
    }
  }, [poolState.inputToken.symbol, poolState.outputToken.symbol, spotPrices]);

  /**
   * Called when the first input field's amount is changed. Calls handlePoolInputsChange to update the amount
   * of the corresponding token in the state, and also calculates the other token's corresponding amount based
   * on spot price (if applicable), and calls handlePoolInputsChange to update that amount as well
   * @param event event passed in from the input field being changed
   */
  const handleInputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      console.log("input changed, current spot price", poolState.inputToken.spotPrice);
      handlePoolInputsChange(event, ActionType.UPDATE_INPUT_TOKEN, "amount");
      // use spot price to calculate output field
      // TODO: a;fjk
      if (poolState.inputToken.spotPrice) {
        const outputPrice = +event.target.value * poolState.inputToken.spotPrice;
        console.log(outputPrice);
        handlePoolInputsChange(outputPrice.toString(), ActionType.UPDATE_OUTPUT_TOKEN, "amount");
      }
    },
    [handlePoolInputsChange, poolState]
  );

  /**
   * Called when the first input field's token is changed from the select/dropdown. Calls
   * handleInputSymbolChange to update store with the selected token's symbol and address
   */
  const handleInputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_INPUT_TOKEN, "symbol");
      handlePoolInputsChange(tokenSymbolToAccountID.get(event.target.value), ActionType.UPDATE_INPUT_TOKEN, "address");
      if (poolState.outputToken.spotPrice) {
        console.log("hihihihihihih", poolState.outputToken.spotPrice);
      }
    },
    [handlePoolInputsChange, poolState, tokenSymbolToAccountID]
  );

  /**
   * Called when the second input field's amount is changed. Calls handlePoolInputsChange to update the amount
   * of the corresponding token in the state, and also calculates the other token's corresponding amount based
   * on spot price (if applicable), and calls handlePoolInputsChange to update that amount as well
   * @param event event passed in from the input field being changed
   */
  const handleOutputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_OUTPUT_TOKEN, "amount");
      // use spot price to calculate input field
      if (poolState.outputToken.spotPrice) {
        const inputPrice = +event.target.value * poolState.outputToken.spotPrice;
        handlePoolInputsChange(inputPrice.toString(), ActionType.UPDATE_INPUT_TOKEN, "amount");
      }
    },
    [handlePoolInputsChange, poolState]
  );

  /**
   * Called when the second input field's token is changed from the select/dropdown. Calls
   * handleInputSymbolChange to update store with the selected token's symbol and address
   */
  const handleOutputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_OUTPUT_TOKEN, "symbol");
      handlePoolInputsChange(tokenSymbolToAccountID.get(event.target.value), ActionType.UPDATE_OUTPUT_TOKEN, "address");
    },
    [handlePoolInputsChange, tokenSymbolToAccountID]
  );

  /**
   * Dispatches event to switch the token inputs. Called when the switch token button is clicked
   */
  const swapTokens = useCallback(() => {
    dispatch({ type: ActionType.SWITCH_INPUT_AND_OUTPUT_TOKEN });
  }, [dispatch]);

  /**
   * Calculates half or max of the user's balance for a given token and calls handlePoolInputsChange to update
   * those values in the store and input field. Called when the Half or Max button on either token input is clicked
   * @param field which input field the calculation should be performed for for (inputToken | outputToken)
   * @param _portion indicates whether to calculate half or max of the balance
   */
  const getPortionOfBalance = (field: "inputToken" | "outputToken", _portion: "half" | "max") => {
    const selectedToken = field === "inputToken" ? poolState.inputToken.symbol : poolState.outputToken.symbol;
    const tokenBalance = getBalanceByTokenSymbol(selectedToken);
    // TODO: remove Math.floor when we are able to handle fractional values
    const portion = _portion === "half" ? Math.floor(tokenBalance / 2) : Math.floor(tokenBalance);
    handlePoolInputsChange(
      portion.toString(),
      field === "inputToken" ? ActionType.UPDATE_INPUT_TOKEN : ActionType.UPDATE_OUTPUT_TOKEN,
      "amount"
    );
  };

  /**
   * Returns the connected wallet's balance of a given token. Used for the
   * balance display in each token input field
   * @param tokenSymbol token symbol of token to get balance of
   * @returns balance of specified token in connected wallet
   */
  const getBalanceByTokenSymbol = useCallback(
    (tokenSymbol: string): number => {
      console.log(tokenSymbol);
      const tokenBalances = walletData?.pairedAccountBalance?.tokens;
      console.log(walletData.pairedAccountBalance.tokens);
      console.log(tokenBalances);
      const tokenId = tokenSymbolToAccountID.get(tokenSymbol);
      return tokenBalances?.find((tokenData: any) => tokenData.tokenId === tokenId)?.balance;
    },
    [walletData, tokenSymbolToAccountID]
  );

  /**
   * Returns the Pool Exchange Ratio display
   */
  const getExchangeRatio = useCallback(() => {
    const firstToken = poolState.inputToken.symbol;
    const secondToken = poolState.outputToken.symbol;
    const selectedTokenSpotPrice = poolState.inputToken.spotPrice;
    return selectedTokenSpotPrice
      ? `1 ${firstToken} = ${selectedTokenSpotPrice.toString().substring(0, 7)} ${secondToken}`
      : "-";
  }, [poolState]);

  // TODO: remove this, keeping for now to add L49A and L49B to wallet for testing purposes if needed
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
              <Flex backgroundColor="#F2F2F2" alignItems={"center"}>
                <Text fontSize="xs" padding="0.25rem" fontWeight="bold">
                  Balance: {getBalanceByTokenSymbol(inputToken?.symbol ?? "") || "Connect to View"}
                </Text>
                <Button variant="xs-text" onClick={() => getPortionOfBalance("inputToken", "half")}>
                  Half
                </Button>
                <Button variant="xs-text" onClick={() => getPortionOfBalance("inputToken", "max")}>
                  Max
                </Button>
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
              <Flex backgroundColor="#F2F2F2" alignItems={"center"}>
                <Text fontSize="xs" padding="0.25rem" fontWeight="bold">
                  Balance: {getBalanceByTokenSymbol(outputToken?.symbol ?? "") || "Connect to View"}
                </Text>
                <Button variant="xs-text" onClick={() => getPortionOfBalance("outputToken", "half")}>
                  Half
                </Button>
                <Button variant="xs-text" onClick={() => getPortionOfBalance("outputToken", "max")}>
                  Max
                </Button>
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
                  {"<0.1%"}
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
            {/*   // TODO: remove this, keeping for now to add L49A and L49B to wallet for testing purposes if needed 
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
            </Button> */}

            <Text></Text>
          </VStack>
        </Center>
      </Box>
    </HStack>
  );
};

export { Pool };
