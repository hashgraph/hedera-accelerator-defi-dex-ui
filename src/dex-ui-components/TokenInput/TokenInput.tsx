import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { Button, TokenAmountInput, TokenSelector } from "../base";
import { ChangeEvent, MouseEvent, useCallback } from "react";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { Token } from "./types";

export const SELECT_TOKEN_TO_VIEW = "Select Token To View";
export const CONNECT_TO_VIEW = "Connect to View";

export interface TokenInputProps {
  "data-testid": string;
  isDisabled?: boolean;
  isHalfAndMaxButtonsVisible?: boolean;
  isLoading?: boolean;
  isPairsLoading?: boolean;
  title: string;
  tokenAmount: number | string;
  tokenSymbol: string | undefined;
  tokenBalance: number | undefined;
  tokenId: string | undefined;
  walletConnectionStatus: HashConnectConnectionState;
  hideTokenSelector?: boolean;
  tokenPairs: Token[] | null;
  onTokenAmountChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTokenSymbolChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onMaxButtonClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onHalfButtonClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A Token Input component provides an input for a token amount, a dropdown to select a token symbol,
 * and text to display a user's wallet balance for the selected token symbol.
 * type: Stateless
 * @param props -
 * @returns
 */
const TokenInput = (props: TokenInputProps) => {
  const {
    title,
    isDisabled = false,
    isHalfAndMaxButtonsVisible = false,
    isLoading = false,
    isPairsLoading = false,
    tokenAmount,
    tokenSymbol,
    tokenBalance,
    tokenId,
    walletConnectionStatus,
    hideTokenSelector,
    tokenPairs,
    onTokenAmountChange,
    onTokenSymbolChange,
    onMaxButtonClick,
    onHalfButtonClick,
  } = props;

  const showTokenBalance = useCallback(() => {
    if (walletConnectionStatus !== HashConnectConnectionState.Paired) {
      return CONNECT_TO_VIEW;
    }
    if (tokenSymbol === undefined || tokenSymbol === "") {
      return SELECT_TOKEN_TO_VIEW;
    }
    return tokenBalance;
  }, [walletConnectionStatus, tokenSymbol, tokenBalance]);

  const getHalfAndMaxButtonDisplays = useCallback(() => {
    if (isHalfAndMaxButtonsVisible) {
      return (
        <>
          <Button variant="xs-text" textStyle="link" textDecorationLine="none" onClick={onHalfButtonClick}>
            Half
          </Button>
          <Button variant="xs-text" textStyle="link" textDecorationLine="none" onClick={onMaxButtonClick}>
            Max
          </Button>
        </>
      );
    }
  }, [isHalfAndMaxButtonsVisible, onHalfButtonClick, onMaxButtonClick]);

  return (
    <>
      <Text color="#4D4D4D" fontSize="xs">
        {title}
      </Text>
      <Box border="1px solid #E7E9EB" borderRadius="5px" backgroundColor="#F2F2F2">
        <Flex>
          <Box flex="5">
            <TokenAmountInput
              data-testid={props["data-testid"]}
              isDisabled={isDisabled}
              value={tokenAmount}
              onChangeHandler={onTokenAmountChange}
              variant="token-amount-input"
            />
          </Box>
          {!hideTokenSelector ? (
            <Box flex="4">
              <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isPairsLoading}>
                <TokenSelector value={tokenId} onChangeHandler={onTokenSymbolChange} tokenPairs={tokenPairs} />
              </Skeleton>
            </Box>
          ) : (
            ""
          )}
        </Flex>
        <Flex padding="0.25rem 0" alignItems="center" backgroundColor="rgba(242,242,244,0.6)" borderRadius="5px">
          <Text textStyle="b3">&nbsp; Balance: &nbsp;</Text>
          <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
            <Text textStyle="b3">{showTokenBalance()}</Text>
          </Skeleton>
          {getHalfAndMaxButtonDisplays()}
        </Flex>
      </Box>
    </>
  );
};

export { TokenInput };
