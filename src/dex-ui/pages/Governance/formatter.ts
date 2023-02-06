import { Proposal } from "../../store/governanceSlice";
import { formatDuration } from "../../utils";
import { FormattedProposal } from "./types";
import { DEX_TOKEN_PRECISION_VALUE } from "../../services";

/**
 * Coverts proposal data into a format that will be displayed in the UI.
 * @param proposal - The proposal data to be formatted.
 * @returns A formatted version of the proposal data.
 */
export const formatProposal = (proposal: Proposal): FormattedProposal => {
  const { id, contractId, type, title, author, description, status, timeRemaining, state, votes, link, timestamp } =
    proposal;
  const [yes, no, abstain, quorum, max] = [
    votes.yes?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber(),
    votes.no?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber(),
    votes.abstain?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber(),
    votes.quorum?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber(),
    votes.max?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber(),
  ];
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
      quorum: (Number(quorum) / Number(max)) * 100,
      remaining: Number(max) - (Number(yes) + Number(no) + Number(abstain)),
      max,
    },
  };
};
