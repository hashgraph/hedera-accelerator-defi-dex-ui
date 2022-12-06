import { ChangeEvent, useCallback, useEffect, useReducer } from "react";
import { Box, HStack, Button, Heading, Flex, IconButton, Spacer } from "@chakra-ui/react";
import { ActionType, initialPoolState, initPoolReducer, poolReducer, AddLiquidityState } from "./reducers";
import { SettingsIcon } from "@chakra-ui/icons";
import { TokenInput } from "../../../dex-ui-components/TokenInput";
import { useDexContext, usePrevious } from "../../hooks";
import { TokenBalanceJson } from "@hashgraph/sdk/lib/account/AccountBalance";
import { SWAP_CONTRACT_ID, TOKEN_SYMBOL_TO_ACCOUNT_ID } from "../../services";
import { mapBigNumberValuesToNumber } from "../Swap/formatters";
import { formatBigNumberToPercent } from "../../utils";
import { useSwapData } from "../../hooks/useSwapData";
import { REFRESH_INTERVAL } from "../../hooks/constants";
import { MetricLabel } from "../../../dex-ui-components";

const AddLiquidity = (): JSX.Element => {
  const { app, wallet, swap, pools } = useDexContext(({ app, wallet, swap, pools }) => ({ app, wallet, swap, pools }));
  const { fee, spotPrices } = swap;
  const formattedFee = formatBigNumberToPercent(fee);
  const formattedSpotPrices = mapBigNumberValuesToNumber(spotPrices);
  const [poolState, dispatch] = useReducer(poolReducer, initialPoolState, initPoolReducer);
  const previousPoolState: AddLiquidityState | undefined = usePrevious(poolState);

  useSwapData(REFRESH_INTERVAL);
  /**
   * Helper function that will dispatch action to update details about tokens in either input depending on
   * which params are passed to it
   * @param event - either the HTML event from the form field (input, dropdown/select) that was interacted with
   *              or a string that contains the desired value to be sent in the payload of the action
   * @param actionType - action type corresponding to which token's store slice should be updated
   *                   (UPDATED_INPUT_TOKEN or UPDATED_OUTPUT_TOKEN)
   * @param field - the specific field within the specified token's store slice that should be updated
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
    pools.sendAddLiquidityTransaction({
      inputToken: poolState.inputToken,
      outputToken: poolState.outputToken,
      contractId: SWAP_CONTRACT_ID,
    });
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolState, pools.sendAddLiquidityTransaction]);

  /**
   * Returns the connected wallet's balance of a given token. Used for the
   * balance display in each token input field
   * @param tokenSymbol - token symbol of token to get balance of
   * @returns balance of specified token in connected wallet
   */
  const getBalanceByTokenSymbol = useCallback(
    (tokenSymbol: string): string => {
      const defaultBalance = "0.0";
      const tokenBalances = wallet?.pairedAccountBalance?.tokens;
      const tokenId = TOKEN_SYMBOL_TO_ACCOUNT_ID.get(tokenSymbol);
      const tokenData = tokenBalances?.find((tokenData: TokenBalanceJson) => tokenData.tokenId === tokenId);
      return tokenData?.balance ?? defaultBalance;
    },
    [wallet]
  );
  /**
   * Whenever there is a change in the selected token in either input field or change in
   * spot prices, retrieve the spot price and dispatch action to update state slices for
   * spot price for each token accordingly
   */
  useEffect(() => {
    const firstTokenSymbol = poolState.inputToken.symbol;
    const secondTokenSymbol = poolState.outputToken.symbol;

    if (firstTokenSymbol && secondTokenSymbol) {
      const firstTokenSpotPrice = formattedSpotPrices?.[`${firstTokenSymbol}=>${secondTokenSymbol}`] || 0;
      const secondTokenSpotPrice = formattedSpotPrices?.[`${secondTokenSymbol}=>${firstTokenSymbol}`] || 0;
      dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "spotPrice", payload: firstTokenSpotPrice });
      dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "spotPrice", payload: secondTokenSpotPrice });
    }
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolState.inputToken.symbol, poolState.outputToken.symbol, spotPrices]);

  /**
   * Whenever there is a change in token selection or wallet balances, retrieve the wallet balance
   * for the selected token(s)
   * // TODO: check on when wallet balance is updated. is not triggering effect after making a transaction
   */
  useEffect(() => {
    if (poolState.inputToken.symbol) {
      const firstTokenBalance = getBalanceByTokenSymbol(poolState.inputToken.symbol);
      dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "balance", payload: firstTokenBalance });
    }
    if (poolState.outputToken.symbol) {
      const secondTokenBalance = getBalanceByTokenSymbol(poolState.outputToken.symbol);
      dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "balance", payload: secondTokenBalance });
    }
  }, [
    dispatch,
    // getBalanceByTokenSymbol,   // for some reason keeping this in the dependency array causes infinite loop
    poolState.inputToken.symbol,
    poolState.outputToken.symbol,
    wallet.pairedAccountBalance,
    getBalanceByTokenSymbol,
  ]);

  /**
   * When spot price changes (ie selected token is changed) calculate the other field/token's value
   */
  useEffect(() => {
    if (
      poolState.inputToken.spotPrice &&
      previousPoolState &&
      poolState.outputToken.amount !== previousPoolState["inputToken"]["amount"]
    ) {
      const outputPrice = +(poolState.inputToken.amount * poolState.inputToken.spotPrice).toFixed(8);
      dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "amount", payload: outputPrice });
      dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "displayedAmount", payload: outputPrice.toString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolState.inputToken.spotPrice]);

  /**
   * When spot price changes (ie selected token is changed) calculate the other field/token's value
   */
  useEffect(() => {
    if (
      poolState.outputToken.spotPrice &&
      previousPoolState &&
      poolState.outputToken.amount !== previousPoolState["outputToken"]["amount"]
    ) {
      const inputPrice = +(poolState.outputToken.amount * poolState.outputToken.spotPrice).toFixed(8);
      dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "amount", payload: inputPrice });
      dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "displayedAmount", payload: inputPrice.toString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolState.outputToken.spotPrice]);

  /**
   * Called when the first input field's amount is changed. Calls handlePoolInputsChange to update the amount
   * of the corresponding token in the state, and also calculates the other token's corresponding amount based
   * on spot price (if applicable), and calls handlePoolInputsChange to update that amount as well
   * @param event - event passed in from the input field being changed
   */
  const handleInputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "displayedAmount", payload: event.target.value });
      dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "amount", payload: +(+event.target.value).toFixed(8) });
      // use spot price to calculate output field
      if (poolState.inputToken.spotPrice) {
        const outputPrice = +(+event.target.value * poolState.inputToken.spotPrice).toFixed(8);
        dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "amount", payload: outputPrice });
        dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "displayedAmount", payload: outputPrice.toString() });
      }
    },
    [poolState]
  );

  /**
   * Called when the first input field's token is changed from the select/dropdown. Calls
   * handleInputSymbolChange to update store with the selected token's symbol and address
   */
  const handleInputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_INPUT_TOKEN, "symbol");
      handlePoolInputsChange(
        TOKEN_SYMBOL_TO_ACCOUNT_ID.get(event.target.value),
        ActionType.UPDATE_INPUT_TOKEN,
        "address"
      );
    },
    [handlePoolInputsChange]
  );

  /**
   * Called when the second input field's amount is changed. Calls handlePoolInputsChange to update the amount
   * of the corresponding token in the state, and also calculates the other token's corresponding amount based
   * on spot price (if applicable), and calls handlePoolInputsChange to update that amount as well
   * @param event - event passed in from the input field being changed
   */
  const handleOutputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: ActionType.UPDATE_OUTPUT_TOKEN,
        field: "displayedAmount",
        payload: event.target.value,
      });
      dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "amount", payload: +(+event.target.value).toFixed(8) });
      // use spot price to calculate input field
      if (poolState.outputToken.spotPrice) {
        const inputPrice = +(+event.target.value * poolState.outputToken.spotPrice).toFixed(8);
        dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "amount", payload: inputPrice });
        dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "displayedAmount", payload: inputPrice.toString() });
      }
    },
    [poolState]
  );

  /**
   * Called when the second input field's token is changed from the select/dropdown. Calls
   * handleInputSymbolChange to update store with the selected token's symbol and address
   */
  const handleOutputSymbolChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlePoolInputsChange(event, ActionType.UPDATE_OUTPUT_TOKEN, "symbol");
      handlePoolInputsChange(
        TOKEN_SYMBOL_TO_ACCOUNT_ID.get(event.target.value),
        ActionType.UPDATE_OUTPUT_TOKEN,
        "address"
      );
    },
    [handlePoolInputsChange]
  );

  /**
   * Calculates half or max of the user's balance for a given token and calls handlePoolInputsChange to update
   * those values in the store and input field. Called when the Half or Max button on either token input is clicked
   * @param field - which input field the calculation should be performed for for (inputToken | outputToken)
   * @param _portion - indicates whether to calculate half or max of the balance
   */
  const getPortionOfBalance = (field: "inputToken" | "outputToken", _portion: "half" | "max") => {
    if (
      (poolState.inputToken.symbol && poolState.inputToken.balance) ||
      (poolState.outputToken.symbol && poolState.outputToken.balance)
    ) {
      const tokenBalance = field === "inputToken" ? poolState.inputToken.balance : poolState.outputToken.balance;
      const portion = _portion === "half" ? (tokenBalance || 0) / 2 : tokenBalance || 0;
      handlePoolInputsChange(
        portion.toString(),
        field === "inputToken" ? ActionType.UPDATE_INPUT_TOKEN : ActionType.UPDATE_OUTPUT_TOKEN,
        "amount"
      );
      handlePoolInputsChange(
        portion.toString(),
        field === "inputToken" ? ActionType.UPDATE_INPUT_TOKEN : ActionType.UPDATE_OUTPUT_TOKEN,
        "displayedAmount"
      );
      if (field === "inputToken" && poolState.inputToken.spotPrice) {
        const outputPrice = portion * poolState.inputToken.spotPrice;
        dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "amount", payload: outputPrice });
        dispatch({ type: ActionType.UPDATE_OUTPUT_TOKEN, field: "displayedAmount", payload: outputPrice.toFixed(8) });
      } else if (field === "outputToken" && poolState.outputToken.spotPrice) {
        const inputPrice = portion * poolState.outputToken.spotPrice;
        dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "amount", payload: inputPrice });
        dispatch({ type: ActionType.UPDATE_INPUT_TOKEN, field: "displayedAmount", payload: inputPrice.toFixed(8) });
      }
    }
  };

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
    pools.send100LabTokensToWallet(wallet.savedPairingData?.accountIds[0] ?? "");
    // Todo: Fixed hook dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, pools.send100LabTokensToWallet]);

  return (
    <HStack>
      <Box
        data-testid="pool-component"
        bg="white"
        borderRadius="15px"
        width="100%"
        minWidth="496px"
        padding="0.5rem 1rem 1rem 1rem"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.15)"
      >
        <Flex>
          <Heading as="h4" size="lg">
            Add Liquidity
          </Heading>
          <Spacer />
          <IconButton
            data-testid="settings-button"
            aria-label="Open and close settings modal."
            icon={<SettingsIcon w={6} h={6} />}
            variant="settings"
          />
        </Flex>
        <TokenInput
          data-testid="add-liquidity-input"
          title="First Token"
          tokenAmount={poolState.inputToken.displayedAmount}
          tokenSymbol={poolState.inputToken.symbol}
          tokenBalance={poolState.inputToken.balance}
          walletConnectionStatus={wallet.hashConnectConnectionState}
          onTokenAmountChange={handleInputAmountChange}
          onTokenSymbolChange={handleInputSymbolChange}
          isHalfAndMaxButtonsVisible={true}
          onMaxButtonClick={() => getPortionOfBalance("inputToken", "max")}
          onHalfButtonClick={() => getPortionOfBalance("inputToken", "half")}
          isLoading={app.isFeatureLoading("pairedAccountBalance")}
        />
        <TokenInput
          data-testid="add-liquidity-output"
          title="Second Token"
          tokenAmount={poolState.outputToken.displayedAmount}
          tokenSymbol={poolState.outputToken.symbol}
          tokenBalance={poolState.outputToken.balance}
          walletConnectionStatus={wallet.hashConnectConnectionState}
          onTokenAmountChange={handleOutputAmountChange}
          onTokenSymbolChange={handleOutputSymbolChange}
          isHalfAndMaxButtonsVisible={true}
          onMaxButtonClick={() => getPortionOfBalance("outputToken", "max")}
          onHalfButtonClick={() => getPortionOfBalance("outputToken", "half")}
          isLoading={app.isFeatureLoading("pairedAccountBalance")}
        />
        <Flex justifyContent={"space-between"} width={"100%"} paddingTop={"1rem"}>
          <Flex flexDirection={"column"}>
            <MetricLabel label="Transaction Fee" value={formattedFee} isLoading={app.isFeatureLoading("fee")} />
          </Flex>
          <Flex flexDirection={"column"}>
            <MetricLabel label="Share of Pool" value={"<0.1%"} />
          </Flex>
          <Flex flexDirection={"column"}>
            <MetricLabel
              label="Pool Exchange Ratio"
              value={getExchangeRatio()}
              isLoading={app.isFeatureLoading("spotPrices")}
            />
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
        {/* // TODO: remove this, keeping for now to add L49A and L49B to wallet for testing purposes if needed  */}
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
          {"Send 100 A and B To Wallet"}
        </Button>
      </Box>
    </HStack>
  );
};

export { AddLiquidity };
