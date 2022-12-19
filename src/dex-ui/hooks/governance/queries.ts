import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useQuery } from "react-query";
import { BigNumber } from "bignumber.js";
import { formatProposal } from "../../pages/Governance/formatter";
import { FormattedProposal } from "../../pages/Governance/types";
import { DexService, HederaService } from "../../services";
import { Proposal } from "../../store/governanceSlice";
import { isNil } from "ramda";

export enum Queries {
  FetchAllProposals = "fetchAllProposals",
  FetchHasVoted = "hasVoted",
}

function useProposalQuery<T>(select: (data: Proposal[]) => T) {
  return useQuery<Proposal[], Error, T, Queries.FetchAllProposals>(
    Queries.FetchAllProposals,
    async () => DexService.fetchAllProposals(),
    {
      select,
    }
  );
}

export function useAllProposals() {
  const formatProposals = (data: Proposal[]) => data.map(formatProposal);
  return useProposalQuery<FormattedProposal[]>(formatProposals);
}

export function useProposal(id: string | undefined) {
  const getProposal = (data: Proposal[]) => {
    const proposal = data.find((proposal: Proposal) => !isNil(id) && BigNumber(id).eq(proposal.id));
    return proposal ? formatProposal(proposal) : undefined;
  };
  return useProposalQuery<FormattedProposal | undefined>(getProposal);
}

export function useHasVoted(contractId: string | undefined, proposalId: string | undefined, signer: HashConnectSigner) {
  return useQuery<boolean | undefined, Error, boolean, Queries.FetchHasVoted>(Queries.FetchHasVoted, async () => {
    if (!isNil(contractId) && !isNil(proposalId))
      return HederaService.fetchHasVoted({ contractId, proposalId, signer });
  });
}
