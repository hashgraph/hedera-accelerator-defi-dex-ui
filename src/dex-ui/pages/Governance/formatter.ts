import { Proposal } from "../../store/governanceSlice";
import { formatDuration } from "../../utils";
import { FormattedProposal } from "./types";

/**
 * Coverts proposal data into a format that will be displayed in the UI.
 * @param proposal - The proposal data to be formatted.
 * @returns A formatted version of the proposal data.
 */
export const formatProposals = (proposal: Proposal): FormattedProposal => {
  const { title, author, description, status, timeRemaining, state, voteCount } = proposal;
  return {
    title,
    author: author.toString(),
    description,
    status,
    timeRemaining: timeRemaining ? formatDuration(timeRemaining) : undefined,
    state,
    voteCount: {
      yes: voteCount.yes?.toNumber(),
      no: voteCount.no?.toNumber(),
      abstain: voteCount.abstain?.toNumber(),
    },
  };
};
