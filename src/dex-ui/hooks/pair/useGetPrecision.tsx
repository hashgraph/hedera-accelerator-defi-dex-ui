import { BigNumber } from "bignumber.js";
import { useQuery } from "react-query";
import { DexService } from "../../services";
import { PairQueries } from "./types";

export function useGetPrecision(selectedAccountId: string | undefined) {
  return useQuery<BigNumber | undefined, Error, BigNumber, PairQueries.FetchPrecision>(
    PairQueries.FetchPrecision,
    async () => {
      try {
        return DexService.fetchPrecisionValue(selectedAccountId ?? "");
      } catch {
        // TODO: A fix for To get Precision and get The UI working when no account is selected
        return DexService.getPrecision();
      }
    }
  );
}
