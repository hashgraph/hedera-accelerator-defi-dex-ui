import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@dex/layouts";
import { Proposal } from "@dao/hooks";
import { Routes } from "@dao/routes";
import { replaceLastRoute } from "@dex/utils";
import { isEmpty, isNotNil } from "ramda";
import { useLocation, useNavigate } from "react-router-dom";
import { ProposalCard } from "./ProposalCard";
import { Color, TransactionIcon } from "@shared/ui-kit";
import { DAO } from "@dao/services";

interface RecentProposalsProps {
  proposals: Proposal[] | undefined;
  dao: DAO;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

export function RecentProposals(props: RecentProposalsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { proposals, dao, isSuccess, isLoading, isError, error } = props;
  function handleClickCreateProposal() {
    navigate(replaceLastRoute(location.pathname, Routes.CreateDAOProposal));
  }

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess && isNotNil(proposals) && !isEmpty(proposals)) {
    return (
      <>
        {proposals.map((transaction, index) => (
          <ProposalCard proposal={transaction} dao={dao} key={index} />
        ))}
      </>
    );
  }

  return (
    <NotFound
      icon={<TransactionIcon boxSize="4rem" stroke={Color.Neutral._900} />}
      message={`We didn't find any recent proposals.`}
      linkText="Create a proposal."
      onLinkClick={handleClickCreateProposal}
    />
  );
}
