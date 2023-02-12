import { isNil, isEmpty } from "ramda";
import { Pool } from "../../../dex-ui/store/poolsSlice/types";
import { TokenState } from "../types";
import { BigNumber } from "bignumber.js";

interface UseCreatePoolFormProps {
  firstToken: TokenState;
  secondToken: TokenState;
  transactionFee: number;
  isTransactionDeadlineValid: boolean;
  allPoolsMetrics: Pool[] | undefined;
}

export function useCreatePoolFormData(props: UseCreatePoolFormProps) {
  /** NOTE: shiftedBy(-4) to comapare the fee as In UI we use % value */
  const pool =
    !isNil(props.allPoolsMetrics) &&
    props.allPoolsMetrics.find(
      (pool) =>
        (pool.name === `${props.firstToken.symbol}-${props.secondToken.symbol}` ||
          pool.name === `${props.secondToken.symbol}-${props.firstToken.symbol}`) &&
        BigNumber(props.transactionFee / 10000).eq(pool.fee ?? BigNumber(0))
    );
  const isSelectedPoolAlreadyExist = isNil(pool) ? false : true;
  const poolAlreadyExistMessage = "Selected Pool Already Exist";

  const isSubmitButtonDisabled =
    isEmpty(props.firstToken.displayAmount) ||
    isNil(props.firstToken.symbol) ||
    isEmpty(props.secondToken.displayAmount) ||
    isNil(props.secondToken.symbol) ||
    !props.isTransactionDeadlineValid ||
    isSelectedPoolAlreadyExist;

  const successMessage = `Created and added
    ${props.firstToken.amount.toFixed(6)} 
    ${props.firstToken.symbol}
    and ${props.secondToken.amount.toFixed(6)} ${props.secondToken.symbol} to pool.`;

  return {
    isSelectedPoolAlreadyExist,
    poolAlreadyExistMessage,
    successMessage,
    isSubmitButtonDisabled,
  };
}
