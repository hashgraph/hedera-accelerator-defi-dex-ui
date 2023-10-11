import { Flex, Text, Button } from "@chakra-ui/react";
import { AlertDialog, NotficationTypes, Notification } from "@shared/ui-kit";
import { ConfirmVoteModalBody } from "./ConfirmVoteModalBody";
import { CancelProposalModalButton } from "./CancelProposalModalButton";
import { useState } from "react";
import { useProposalDetails } from "./useProposalDetails";
import { VoteType } from "./types";
import { useDexContext, usePairedWalletDetails } from "@dex/hooks";
import { useNavigate } from "react-router-dom";
import { formatProposal } from "../Governance/formatter";

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
  const navigate = useNavigate();
  const {
    proposal,
    castVote,
    cancelProposal,
    executeProposal,
    areVoteButtonsVisible,
    areButtonsHidden,
    isHasVotedMessageVisible,
    isExecuteButtonVisible,
    isWalletConnected,
    doesUserHaveGodTokens,
    votingPower,
    isCancelButtonVisible,
  } = props.proposalDetails;

  const formattedProposal = proposal.data ? formatProposal(proposal.data) : undefined;

  const { walletId } = usePairedWalletDetails();
  const isUserAuthor = formattedProposal?.author === walletId && isWalletConnected;

  const handleGetDexCoinsClicked = () => navigate("/swap");

  async function handleExecuteClicked() {
    props.resetServerState();
    const signer = wallet.getSigner();
    //TODO: Dex Governance is deprecated and will be removed in the next ticket to no need to fix it.
    // executeProposal.mutate({
    //   contractId: proposal.data?.contractId ?? "",
    //   title: proposal.data?.title ?? "",
    //   signer,
    //   transfersFromAccount: proposal.data?.transferFromAccount,
    //   tokenId: proposal.data?.tokenToTransfer,
    //   tokenAmount: proposal.data?.transferTokenAmount,
    // });
  }

  function handleCancelProposalClicked() {
    props.resetServerState();
    //TODO: Dex Governance is deprecated and will be removed in the next ticket to no need to fix it.
    // if (proposal) {
    //   const signer = wallet.getSigner();
    //   cancelProposal.mutate({
    //     contractId: proposal.data?.contractId ?? "",
    //     title: proposal.data?.title ?? "",
    //     signer,
    //   });
    // }
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

  if (areButtonsHidden && isCancelButtonVisible) {
    return (
      <>
        <Notification
          type={NotficationTypes.WARNING}
          message={"This proposal was created by you. You can cancel your proposal to get your DexCoins back."}
          isLinkShown={true}
          linkText="Cancel Proposal"
          isButton={true}
          handleLinkClick={handleCancelProposalClicked}
          isVisible={isCancelButtonVisible && isUserAuthor}
          handleClickClose={handleNotificationCloseButtonClicked}
        />
      </>
    );
  }

  if (areButtonsHidden) {
    return <></>;
  }

  if (isHasVotedMessageVisible) {
    return (
      <>
        <Text textStyle="h3">Vote on Proposal</Text>
        <Text textStyle="b2">You have voted on this proposal.</Text>
        <Notification
          type={NotficationTypes.WARNING}
          message={"This proposal was created by you. You can cancel your proposal to get your DexCoins back."}
          isLinkShown={true}
          linkText="Cancel Proposal"
          isButton={true}
          handleLinkClick={handleCancelProposalClicked}
          isVisible={isCancelButtonVisible && isUserAuthor}
          handleClickClose={handleNotificationCloseButtonClicked}
        />
      </>
    );
  }

  if (isExecuteButtonVisible) {
    return (
      <Flex flexDirection="row" gap="1rem" alignItems="start">
        <CancelProposalModalButton
          proposal={formattedProposal}
          cancelProposal={cancelProposal}
          votingPower={votingPower}
          isOpenDialogButtonDisabled={proposal === undefined}
          isOpenDialogButtonVisible={isUserAuthor}
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

  if (areVoteButtonsVisible && !isWalletConnected) {
    return (
      <>
        <Text textStyle="h3">Vote on Proposal</Text>
        <Flex width="fit-content">
          <Notification
            type={NotficationTypes.WARNING}
            message={"You’ll need to connect a wallet before you can vote on a proposal."}
          />
        </Flex>
      </>
    );
  }

  if (areVoteButtonsVisible && isWalletConnected && !doesUserHaveGodTokens) {
    return (
      <>
        <Text textStyle="h3">Vote on Proposal</Text>
        <Flex direction="column" gap="4" width="fit-content">
          <Notification
            type={NotficationTypes.WARNING}
            message={"You’ll need some DexCoin in order to vote on proposals"}
          />
          <Button variant="secondary" width="290px" borderRadius="2px" onClick={handleGetDexCoinsClicked}>
            Get DexCoins to Vote
          </Button>
        </Flex>
      </>
    );
  }

  if (areVoteButtonsVisible && isWalletConnected && doesUserHaveGodTokens) {
    return (
      <>
        <Text textStyle="h3">Vote on Proposal</Text>
        <Flex gap="4">
          <AlertDialog
            openDialogButtonStyles={{ flex: "1" }}
            openDialogButtonText="Yes"
            isOpenDialogButtonDisabled={proposal === undefined}
            title="Confirm Vote"
            body={<ConfirmVoteModalBody votingPower={votingPower} />}
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
            body={<ConfirmVoteModalBody votingPower={votingPower} />}
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
            body={<ConfirmVoteModalBody votingPower={votingPower} />}
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
          isVisible={isCancelButtonVisible && isUserAuthor}
          handleClickClose={handleNotificationCloseButtonClicked}
        />
      </>
    );
  }

  return <></>;
}
