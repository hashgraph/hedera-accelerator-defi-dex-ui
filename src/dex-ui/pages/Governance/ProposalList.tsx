import { ReactElement } from "react";
import { Skeleton } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { FormattedProposal } from "./types";
import { useAllProposals } from "../../hooks";

export function ProposalList(): ReactElement {
  const { data: proposals, error, isLoading, isError } = useAllProposals();

  if (isLoading) {
    <>
      <Skeleton height="92px" speed={0.4} fadeDuration={0} />
      <Skeleton height="92px" speed={0.4} fadeDuration={0} />
      <Skeleton height="92px" speed={0.4} fadeDuration={0} />
      <Skeleton height="92px" speed={0.4} fadeDuration={0} />
      <Skeleton height="92px" speed={0.4} fadeDuration={0} />
    </>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      {proposals?.map((proposal: FormattedProposal, index: number) => (
        <ProposalCard proposal={proposal} key={index} />
      ))}
    </>
  );
}
