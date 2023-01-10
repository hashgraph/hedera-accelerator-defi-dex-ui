import { Button, Flex, Text } from "@chakra-ui/react";
import { AlertDialog, NotficationTypes, Notification } from "../../../dex-ui-components";
import { GovernanceTokenId } from "../../services";
import { ConfirmVoteModalBody } from "./ConfirmVoteModalBody";
import { CancelProposalModalButton } from "./CancelProposalModalButton";
import { useState } from "react";
import { useProposalDetails } from "./useProposalDetails";
import { VoteType } from "./types";
import { useDexContext } from "../../hooks";

type UseProposalDetailsData = ReturnType<typeof useProposalDetails>;

interface ProposalDetailsControlsProps {
  proposalDetails: UseProposalDetailsData;
  resetServerState: () => void;
}

export function ProposalDetailsControls(props: ProposalDetailsControlsProps) {
  const [dialogState, setDialogState] = useState({
    isVoteYesOpen: false,
    isVoteNoOpen: false,
    isVoteAbstainOpen: false,
    isCancelProposalOpen: false,
  });
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const {
    proposal,
    castVote,
    cancelProposal,
    executeProposal,
    claimGODTokens,
    areVoteButtonsVisible,
    isClaimTokenButtonVisible,
    areButtonsHidden,
    isHasVotedMessageVisible,
    isExecuteButtonVisible,
  } = props.proposalDetails;

  const isUserProposalCreator = proposal.data?.author === wallet.getSigner().getAccountId().toString();

  async function handleExecuteClicked() {
    props.resetServerState();
    const signer = wallet.getSigner();
    executeProposal.mutate({ contractId: proposal.data?.contractId ?? "", title: proposal.data?.title ?? "", signer });
  }

  async function handleClaimGODTokensClicked() {
    props.resetServerState();
    const signer = wallet.getSigner();
    claimGODTokens.mutate({ contractId: proposal.data?.contractId ?? "", proposalId: proposal.data?.id ?? "", signer });
  }

  function handleCancelProposalClicked() {
    props.resetServerState();
    if (proposal) {
      const signer = wallet.getSigner();
      cancelProposal.mutate({
        contractId: proposal.data?.contractId ?? "",
        title: proposal.data?.title ?? "",
        signer,
      });
    }
    setDialogState({ ...dialogState, isCancelProposalOpen: false });
  }

  function handleNotificationCloseButtonClicked() {
    props.resetServerState();
  }

  function handleVoteButtonClicked(voteType: VoteType) {
    props.resetServerState();
    if (proposal) {
      const signer = wallet.getSigner();
      castVote.mutate({
        contractId: proposal.data?.contractId ?? "",
        proposalId: proposal.data?.id ?? "",
        voteType,
        signer,
      });
    }
    if (voteType === VoteType.For) {
      setDialogState({ ...dialogState, isVoteYesOpen: false });
    }
    if (voteType === VoteType.Against) {
      setDialogState({ ...dialogState, isVoteNoOpen: false });
    }
    if (voteType === VoteType.Abstain) {
      setDialogState({ ...dialogState, isVoteAbstainOpen: false });
    }
  }

  function handleVoteYesClicked() {
    handleVoteButtonClicked(VoteType.For);
  }

  function handleVoteNoClicked() {
    handleVoteButtonClicked(VoteType.Against);
  }

  function handleVoteAbstainClicked() {
    handleVoteButtonClicked(VoteType.Abstain);
  }

  if (areButtonsHidden) {
    return <></>;
  }

  if (isHasVotedMessageVisible) {
    return (
      <>
        <Text textStyle="h3">Vote on Proposal</Text>
        <Text textStyle="b2">You have voted on this proposal.</Text>
      </>
    );
  }

  if (isExecuteButtonVisible) {
    return (
      <Flex flexDirection="row" gap="1rem" alignItems="start">
        <CancelProposalModalButton
          proposal={proposal.data}
          cancelProposal={cancelProposal}
          governanceTokenId={GovernanceTokenId}
          isOpenDialogButtonDisabled={proposal === undefined}
          isOpenDialogButtonVisible={isUserProposalCreator}
          isAlertDialogOpen={dialogState.isCancelProposalOpen}
          onAlertDialogOpen={() => setDialogState({ ...dialogState, isCancelProposalOpen: true })}
          onAlertDialogClose={() => setDialogState({ ...dialogState, isCancelProposalOpen: false })}
          resetServerState={props.resetServerState}
        />
        <Button variant="primary" width="290px" onClick={handleExecuteClicked}>
          Execute
        </Button>
      </Flex>
    );
  }

  if (isClaimTokenButtonVisible) {
    return (
      <Button variant="primary" width="290px" onClick={handleClaimGODTokensClicked}>
        Claim Governance Tokens
      </Button>
    );
  }

  if (areVoteButtonsVisible) {
    return (
      <>
        <Text textStyle="h3">Vote on Proposal</Text>
        <Flex gap="4">
          <AlertDialog
            openDialogButtonStyles={{ flex: "1" }}
            openDialogButtonText="Yes"
            isOpenDialogButtonDisabled={proposal === undefined}
            title="Confirm Vote"
            body={<ConfirmVoteModalBody governanceTokenId={GovernanceTokenId} />}
            footer={
              <Button flex="1" onClick={handleVoteYesClicked}>
                Confirm Vote Yes
              </Button>
            }
            alertDialogOpen={dialogState.isVoteYesOpen}
            onAlertDialogOpen={() => setDialogState({ ...dialogState, isVoteYesOpen: true })}
            onAlertDialogClose={() => setDialogState({ ...dialogState, isVoteYesOpen: false })}
          />
          <AlertDialog
            openDialogButtonStyles={{ flex: "1" }}
            openDialogButtonText="No"
            isOpenDialogButtonDisabled={proposal === undefined}
            title="Confirm Vote"
            body={<ConfirmVoteModalBody governanceTokenId={GovernanceTokenId} />}
            footer={
              <Button flex="1" onClick={handleVoteNoClicked}>
                Confirm Vote No
              </Button>
            }
            alertDialogOpen={dialogState.isVoteNoOpen}
            onAlertDialogOpen={() => setDialogState({ ...dialogState, isVoteNoOpen: true })}
            onAlertDialogClose={() => setDialogState({ ...dialogState, isVoteNoOpen: false })}
          />
          <AlertDialog
            openDialogButtonStyles={{ flex: "1" }}
            openDialogButtonText="Abstain"
            isOpenDialogButtonDisabled={proposal === undefined}
            title="Confirm Vote"
            body={<ConfirmVoteModalBody governanceTokenId={GovernanceTokenId} />}
            footer={
              <Button flex="1" onClick={handleVoteAbstainClicked}>
                Confirm Vote Abstain
              </Button>
            }
            alertDialogOpen={dialogState.isVoteAbstainOpen}
            onAlertDialogOpen={() => setDialogState({ ...dialogState, isVoteAbstainOpen: true })}
            onAlertDialogClose={() => setDialogState({ ...dialogState, isVoteAbstainOpen: false })}
          />
        </Flex>
        <Notification
          type={NotficationTypes.WARNING}
          message={"This proposal was created by you. You can cancel your proposal to get your DexCoins back."}
          isLinkShown={true}
          linkText="Cancel Proposal"
          isButton={true}
          handleLinkClick={handleCancelProposalClicked}
          isVisible={areVoteButtonsVisible && isUserProposalCreator}
          handleClickClose={handleNotificationCloseButtonClicked}
        />
      </>
    );
  }

  return <></>;
}
