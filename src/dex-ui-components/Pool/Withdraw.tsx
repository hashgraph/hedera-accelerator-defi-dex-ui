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
import { ChangeEvent, useState, useCallback } from "react";
import { MetricLabel } from "..";
import { WalletConnectionStatus } from "../models/wallet.model";
import { TokenInput } from "../TokenInput";

export interface WithdrawProps {
  walletConnectionStatus: WalletConnectionStatus;
  poolLpDetails: LPTokenDetails;
  poolLiquidityDetails: PoolLiquidityDetails;
  onWithdrawClick: (lpAmount: number) => void;
  onInputAmountChange?: (lpAmount: number) => void;
  disableWithdrawButton?: boolean;
  loading: Array<string>;
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

/** TODO: Move to a shared util file */
const isLoading = (loading: Array<string>, feature: string) => loading.includes(feature);

const WithdrawComponent = (props: WithdrawProps) => {
  const {
    walletConnectionStatus,
    poolLpDetails,
    poolLiquidityDetails,
    onWithdrawClick,
    onInputAmountChange,
    disableWithdrawButton,
    loading,
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
          walletConnectionStatus={walletConnectionStatus}
          onTokenAmountChange={handleInputAmountChange}
          isHalfAndMaxButtonsVisible={true}
          hideTokenSelector={true}
          onMaxButtonClick={() => getPortionOfBalance("max")}
          onHalfButtonClick={() => getPortionOfBalance("half")}
          isLoading={isLoading(loading, "walletData")}
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
                      isLoading={loading.includes("allPoolsMetrics") || loading.includes("userPoolsMetrics")}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={`${poolLiquidityDetails.firstToken.tokenSymbol} to Withdraw`}
                      value={`${poolLiquidityDetails.firstToken.userProvidedLiquidity}`}
                      isLoading={loading.includes("allPoolsMetrics") || loading.includes("userPoolsMetrics")}
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
                      isLoading={loading.includes("allPoolsMetrics") || loading.includes("userPoolsMetrics")}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={`${poolLiquidityDetails.secondToken.tokenSymbol} to Withdraw`}
                      value={`${poolLiquidityDetails.secondToken.userProvidedLiquidity}`}
                      isLoading={loading.includes("allPoolsMetrics") || loading.includes("userPoolsMetrics")}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <MetricLabel
                      label={"Remaining share of pool"}
                      value={poolLpDetails.userLpPercentage}
                      isLoading={loading.includes("allPoolsMetrics") || loading.includes("userPoolsMetrics")}
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
        >
          {"Withdraw"}
        </Button>
      </Box>
    </HStack>
  );
};

export { WithdrawComponent };
