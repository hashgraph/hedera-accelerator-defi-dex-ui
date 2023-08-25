import { PoolTransactionFee, PoolQueries, TransactionFeeLabelValue } from "./types";
import { useQuery } from "react-query";
import { DexService } from "../../services";
import { BigNumber } from "bignumber.js";

type UsePoolQueryKey = [PoolQueries.CreatePool, "transactionFeeList"];

export function useCreatePoolTransactionFee() {
  function formatTransactionFeeArray(transactionFee: BigNumber[]): PoolTransactionFee[] {
    if (transactionFee.length % 2 !== 0) {
      throw Error(`Helper: Invalid items size = ${transactionFee.length}`);
    }
    const details: PoolTransactionFee[] = [];
    for (let i = 0; i < transactionFee.length; i += 2) {
      const key = Number(transactionFee[i]);
      const value = Number(transactionFee[i + 1]);
      details.push({ key, value, label: `${value / 100}% ${TransactionFeeLabelValue[key]}` });
    }
    return details;
  }

  return useQuery<BigNumber[], Error, PoolTransactionFee[], UsePoolQueryKey>(
    [PoolQueries.CreatePool, "transactionFeeList"],
    async () => DexService.getTransactionFees(),
    {
      select: formatTransactionFeeArray,
    }
  );
}
