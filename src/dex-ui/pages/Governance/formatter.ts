import { Proposal } from "../../store/governanceSlice";
import { formatDuration } from "../../utils";
import { FormattedProposal } from "./types";
import { DEX_TOKEN_PRECISION_VALUE } from "../../services";
import { BigNumber } from "bignumber.js";

/**
 * Coverts proposal data into a format that will be displayed in the UI.
 * @param proposal - The proposal data to be formatted.
 * @returns A formatted version of the proposal data.
 */
export const formatProposal = (proposal: Proposal): FormattedProposal => {
  const { id, contractId, type, title, author, description, status, timeRemaining, state, votes, link, timestamp } =
    proposal;
  const [yes, no, abstain, max] = [
    Number(votes.yes?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toFixed(3)),
    Number(votes.no?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toFixed(3)),
    Number(votes.abstain?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toFixed(3)),
    Number(votes.max?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toFixed(3)),
  ];

  const quorum = votes.quorum
    ?.div(votes.max ?? BigNumber(1))
    .multipliedBy(BigNumber(100))
    .toFixed(3);

  const totalVotes = votes.yes?.plus(votes.no ?? BigNumber(0)).plus(votes.abstain ?? BigNumber(0));
  const remaining = votes.max
    ?.minus(totalVotes ?? BigNumber(0))
    .shiftedBy(-DEX_TOKEN_PRECISION_VALUE)
    .toFixed(3);
  return {
    id: id.toString(),
    contractId,
    type,
    title,
    author: author.toString(),
    description,
    status,
    link,
    timestamp,
    timeRemaining: timeRemaining ? formatDuration(timeRemaining) : undefined,
    state,
    votes: {
      yes,
      no,
      abstain,
      quorum: Number(quorum),
      remaining: Number(remaining),
      max,
    },
  };
};
