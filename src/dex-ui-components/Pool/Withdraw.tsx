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
import { WalletConnectionStatus } from "../models/wallet.model";
import { TokenInput } from "../TokenInput";

export interface WithdrawProps {
  walletConnectionStatus: WalletConnectionStatus;
  poolLpDetails: LPTokenDetails;
  poolLiquidityDetails: PoolLiquidityDetails;
  onWithdrawClick: (lpAmount: number) => void;
  onInputAmountChange?: (lpAmount: number) => void;
  disableWithdrawButton?: boolean;
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

interface PoolMetricDisplayProps {
  label: string;
  value: string;
}

const PoolMetricDisplay = (props: PoolMetricDisplayProps) => {
  const { label, value } = props;

  return (
    <Flex flexDirection={"column"}>
      <Text fontSize={"10px"} lineHeight={"12px"}>
        {label}
      </Text>
      <Text fontSize={"14px"} lineHeight={"17px"}>
        {value}
      </Text>
    </Flex>
  );
};

const WithdrawComponent = (props: WithdrawProps) => {
  const {
    walletConnectionStatus,
    poolLpDetails,
    poolLiquidityDetails,
    onWithdrawClick,
    onInputAmountChange,
    disableWithdrawButton,
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
      <Box data-testid="withdraw-liquidity-component" bg="white" borderRadius="24px" width="100%" padding="1rem">
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
        />
        <TableContainer>
          <Table variant={"unstyled"}>
            <Tbody>
              <Tr>
                <>
                  <Td padding={"12px 40px 0 0"}>
                    <PoolMetricDisplay
                      label={`${poolLiquidityDetails.firstToken.tokenSymbol} in pool`}
                      value={`${poolLiquidityDetails.firstToken.poolLiquidity}`}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <PoolMetricDisplay
                      label={`${poolLiquidityDetails.firstToken.tokenSymbol} to Withdraw`}
                      value={`${poolLiquidityDetails.firstToken.userProvidedLiquidity}`}
                    />
                  </Td>
                </>
              </Tr>
              <Tr>
                <>
                  <Td padding={"12px 40px 0 0"}>
                    <PoolMetricDisplay
                      label={`${poolLiquidityDetails.secondToken.tokenSymbol} in pool`}
                      value={`${poolLiquidityDetails.secondToken.poolLiquidity}`}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <PoolMetricDisplay
                      label={`${poolLiquidityDetails.secondToken.tokenSymbol} to Withdraw`}
                      value={`${poolLiquidityDetails.secondToken.userProvidedLiquidity}`}
                    />
                  </Td>
                  <Td padding={"12px 40px 0 0"}>
                    <PoolMetricDisplay label={"Remaining share of pool"} value={poolLpDetails.userLpPercentage} />
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
          marginBottom="0.5rem"
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
