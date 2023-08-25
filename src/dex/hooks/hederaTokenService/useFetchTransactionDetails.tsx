import { useQuery } from "react-query";
import { DexService, MirrorNodeTransaction } from "../../services";
import { HTSQueries } from "./types";
import { isNil } from "ramda";

type UseTransactionDetailsKey = [HTSQueries.TransactionDetails, string];

export function useFetchTransactionDetails(transactionId: string) {
  return useQuery<MirrorNodeTransaction[] | undefined, Error, MirrorNodeTransaction[], UseTransactionDetailsKey>(
    [HTSQueries.TransactionDetails, transactionId],
    async () => {
      if (isNil(transactionId) || transactionId.length === 0) return;
      const stringArray = transactionId.split("@");
      const idPart = stringArray[1];
      const formattedId = idPart.replace(/[.]/g, "-");
      const formattedTransactionId = `${stringArray[0]}-${formattedId}`;
      return await DexService.fetchTransactionRecord(formattedTransactionId);
    },
    {
      enabled: !!transactionId,
      staleTime: 5,
      retryDelay: 1000,
    }
  );
}
