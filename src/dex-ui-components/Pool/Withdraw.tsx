import { SettingsIcon } from "@chakra-ui/icons";
import {
  Box,
  HStack,
  Flex,
  Heading,
  Spacer,
  IconButton,
  Button,
  Text,
  TableContainer,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { ChangeEvent, useState, useCallback } from "react";
import { MetricLabel } from "..";
import { NewTokenPair } from "../../dex-ui/services";
import { AppFeatures } from "../../dex-ui/store/appSlice";
import { TokenInput } from "../TokenInput";
import { getLPTokens } from "./utils";

export interface WithdrawProps {
  walletConnectionStatus: HashConnectConnectionState;
  poolLpDetails: LPTokenDetails;
  poolLiquidityDetails: PoolLiquidityDetails;
  tokenPairs: NewTokenPair[] | null;
  onWithdrawClick: (lpAmount: number) => void;
  onInputAmountChange?: (lpAmount: number) => void;
  disableWithdrawButton?: boolean;
  isFeatureLoading: <T extends AppFeatures>(feature: T) => boolean;
}

interface LPTokenDetails {
  tokenSymbol: string;
  userLpAmount: number;
  userLpPercentage: string;
}

interface TokenLiquidityDetails {
  tokenSymbol: string;
  poolLiquidity: number;
  userProvidedLiquidity: number;
}

interface PoolLiquidityDetails {
  firstToken: TokenLiquidityDetails;
  secondToken: TokenLiquidityDetails;
}

const WithdrawComponent = (props: WithdrawProps) => {
  const {
    walletConnectionStatus,
    poolLpDetails,
    poolLiquidityDetails,
    onWithdrawClick,
    onInputAmountChange,
    disableWithdrawButton,
    tokenPairs,
    isFeatureLoading,
  } = props;

  const [localWithdrawState, setLocalWithdrawState] = useState({
    lpInputAmount: "0",
  });

  const handleInputAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onInputAmountChange) onInputAmountChange(+event.target.value);
    setLocalWithdrawState({ ...localWithdrawState, lpInputAmount: event.target.value });
  };

  const getPortionOfBalance = useCallback(
    (portion: "half" | "max") => {
      setLocalWithdrawState({
        ...localWithdrawState,
        lpInputAmount:
          portion === "half" ? (+poolLpDetails.userLpAmount / 2).toString() : poolLpDetails.userLpAmount.toString(),
      });
    },
    [localWithdrawState, poolLpDetails.userLpAmount]
  );

  return (
    <HStack>
      <Box
        data-testid="withdraw-liquidity-component"
        bg="white"
        borderRadius="15px"
        width="100%"
        minWidth="496px"
        padding="0.5rem 1rem 1rem 1rem"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.15)"
      >
        <Flex>
          <Heading as="h4" size="lg">
            Withdraw
          </Heading>
          <Spacer />
          <IconButton
            data-testid="withdraw-liquidity-settings-button"
            aria-label="Open and close settings modal."
            icon={<SettingsIcon w={6} h={6} />}
            variant="settings"
          />
        </Flex>
        <Text>{poolLpDetails.tokenSymbol}</Text>
        <TokenInput
          data-testid="lp-to-withdraw-input-component"
          title="LP to Withdraw"
          tokenAmount={localWithdrawState.lpInputAmount}
          tokenSymbol={poolLpDetails.tokenSymbol}
          tokenBalance={poolLpDetails.userLpAmount}
          tokenPairs={getLPTokens(tokenPairs ?? [])}
          walletConnectionStatus={walletConnectionStatus}
          onTokenAmountChange={handleInputAmountChange}
          isHalfAndMaxButtonsVisible={true}
          hideTokenSelector={true}
          onMaxButtonClick={() => getPortionOfBalance("max")}
          onHalfButtonClick={() => getPortionOfBalance("half")}
          isLoading={isFeatureLoading("pairedAccountBalance")}
        />
        <TableContainer>
          <Table variant={"unstyled"}>
            <Tbody>
              <Tr>
                <>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={`${poolLiquidityDetails.firstToken.tokenSymbol} in pool`}
                      value={`${poolLiquidityDetails.firstToken.poolLiquidity}`}
                      isLoading={isFeatureLoading("allPoolsMetrics") || isFeatureLoading("userPoolsMetrics")}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={`${poolLiquidityDetails.firstToken.tokenSymbol} to Withdraw`}
                      value={`${poolLiquidityDetails.firstToken.userProvidedLiquidity}`}
                      isLoading={isFeatureLoading("allPoolsMetrics") || isFeatureLoading("userPoolsMetrics")}
                    />
                  </Td>
                </>
              </Tr>
              <Tr>
                <>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={`${poolLiquidityDetails.secondToken.tokenSymbol} in pool`}
                      value={`${poolLiquidityDetails.secondToken.poolLiquidity}`}
                      isLoading={isFeatureLoading("allPoolsMetrics") || isFeatureLoading("userPoolsMetrics")}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={`${poolLiquidityDetails.secondToken.tokenSymbol} to Withdraw`}
                      value={`${poolLiquidityDetails.secondToken.userProvidedLiquidity}`}
                      isLoading={isFeatureLoading("allPoolsMetrics") || isFeatureLoading("userPoolsMetrics")}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={"Remaining share of pool"}
                      value={poolLpDetails.userLpPercentage}
                      isLoading={isFeatureLoading("allPoolsMetrics") || isFeatureLoading("userPoolsMetrics")}
                    />
                  </Td>
                </>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Button
          onClick={() => onWithdrawClick(+localWithdrawState.lpInputAmount)}
          data-testid="withdraw-liquidity-button"
          size="lg"
          height="48px"
          width="100%"
          border="2px"
          marginTop="0.5rem"
          bg="black"
          color="white"
          fontSize="16px"
          fontWeight="500"
          disabled={disableWithdrawButton}
          _hover={{ opacity: "0.4" }}
        >
          {"Withdraw"}
        </Button>
      </Box>
    </HStack>
  );
};

export { WithdrawComponent };
