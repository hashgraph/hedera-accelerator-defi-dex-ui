import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useQuery } from "react-query";
import { DexService } from "../../services";
import { isNil } from "ramda";
import { GovernanceQueries } from "./types";

export function useHasVoted(contractId: string | undefined, proposalId: string | undefined, signer: HashConnectSigner) {
  return useQuery<boolean | undefined, Error, boolean, GovernanceQueries.FetchHasVoted>(
    GovernanceQueries.FetchHasVoted,
    async () => {
      if (!isNil(contractId) && !isNil(proposalId)) {
        const accountId = signer.getAccountId().toString();
        return DexService.fetchHasVoted({ governorAccountId: contractId, proposalId, accountId });
      }
    }
  );
}
