import { Box, Text, Flex, Button, SimpleGrid } from "@chakra-ui/react";
import {
  Color,
  CheckCircleUnfilledIcon,
  LightningBoltIcon,
  AlertDialog,
  HorizontalStackBarChart,
} from "@dex-ui-components";
import { VoteType } from "@pages";
import { TransactionResponse } from "@hashgraph/sdk";
import {
  GovernanceMutations,
  Proposal,
  ProposalStatus,
  UseCancelProposalParams,
  UseCastVoteParams,
  useDexContext,
  UseExecuteProposalParams,
} from "@hooks";
import { useState } from "react";
import { UseMutationResult } from "react-query";
import { ProposalVoteModal } from "./ProposalVoteModal";

interface GovernanceProposalConfirmationDetailsProps {
  proposal: Proposal;
  status: ProposalStatus;
  msgValue: number;
  hexStringData: string;
  operation: number;
  nonce: number;
  votingPower: string;
  hasConnectedWalletVoted: boolean;
  castVote: UseMutationResult<TransactionResponse | undefined, Error, UseCastVoteParams, GovernanceMutations.CastVote>;
  executeProposal: UseMutationResult<
    TransactionResponse | undefined,
    Error,
    UseExecuteProposalParams,
    GovernanceMutations.ExecuteProposal
  >;
  cancelProposal: UseMutationResult<
    TransactionResponse | undefined,
    Error,
    UseCancelProposalParams,
    GovernanceMutations.CancelProposal
  >;
}

export function GovernanceProposalConfirmationDetails(props: GovernanceProposalConfirmationDetailsProps) {
  const [dialogState, setDialogState] = useState({
    isVoteOpen: false,
    isCancelProposalOpen: false,
  });
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const { proposal, votingPower, castVote, executeProposal, cancelProposal, status, hasConnectedWalletVoted } = props;

  const contractId = proposal?.contractId ?? "";

  async function handleVoteButtonClicked(voteType: VoteType) {
    resetServerState();
    if (proposal) {
      const signer = wallet.getSigner();
      castVote.mutate({
        contractId: contractId,
        proposalId: proposal.proposalId ?? "",
        voteType,
        signer,
      });
    }
    setDialogState({ ...dialogState, isVoteOpen: false });
  }

  async function handleClickExecuteTransaction() {
    resetServerState();
    if (proposal) {
      const signer = wallet.getSigner();
      executeProposal.mutate({
        contractId: contractId,
        title: proposal?.title ?? "",
        signer,
        transfersFromAccount: proposal.sender,
        tokenId: proposal.tokenId,
        tokenAmount: proposal.amount,
      });
    }
  }

  function handleCancelProposalClicked() {
    resetServerState();
    if (proposal) {
      const signer = wallet.getSigner();
      cancelProposal.mutate({
        contractId: contractId,
        title: proposal?.title ?? "",
        signer,
      });
    }
    setDialogState({ ...dialogState, isCancelProposalOpen: false });
  }

  function resetServerState() {
    castVote.reset();
    executeProposal.reset();
    cancelProposal.reset();
  }

  const ConfirmationDetailsButtons: Readonly<{ [key in ProposalStatus]: JSX.Element }> = {
    [ProposalStatus.Pending]: hasConnectedWalletVoted ? (
      <Button isDisabled leftIcon={<CheckCircleUnfilledIcon boxSize={4} />}>
        You have voted
      </Button>
    ) : (
      <>
        <Flex gap="4">
          <AlertDialog
            openDialogButtonStyles={{ flex: "1" }}
            openDialogButtonText="Vote"
            isOpenDialogButtonDisabled={proposal === undefined}
            title="Confirm Vote"
            body={<ProposalVoteModal votingPower={votingPower} handleVoteButtonClicked={handleVoteButtonClicked} />}
            alertDialogOpen={dialogState.isVoteOpen}
            onAlertDialogOpen={() => setDialogState({ ...dialogState, isVoteOpen: true })}
            onAlertDialogClose={() => setDialogState({ ...dialogState, isVoteOpen: false })}
          />
        </Flex>
      </>
    ),
    [ProposalStatus.Queued]: (
      <Flex direction="column" gap={2}>
        <AlertDialog
          openModalComponent={
            <Button variant="secondary" textStyle="h3" width="290px">
              Cancel
            </Button>
          }
          title="Cancel Proposal"
          body={
            <Flex flexDirection="column" gap="1.25rem">
              <Text textStyle="b1" fontSize="1rem">
                {`You’re about to cancel ${proposal?.title}.
                 If you do this, Governance tokens will be refunded to you and to
            anyone that voted.`}
              </Text>
              <Flex direction="row">
                <Text flex="1" textStyle="b3" color={Color.Grey_02}>
                  Governance tokens Refunded to You
                </Text>
                <Text flex="1" textStyle="b3" textAlign="right">
                  {votingPower}
                </Text>
              </Flex>
            </Flex>
          }
          footer={
            <Flex flexDirection="column" width="100%" gap="0.5rem">
              <Button onClick={handleCancelProposalClicked}>Cancel Proposal</Button>
              <Button
                variant="secondary"
                onClick={() => setDialogState({ ...dialogState, isCancelProposalOpen: false })}
              >
                Don't Cancel
              </Button>
            </Flex>
          }
          alertDialogOpen={dialogState.isCancelProposalOpen}
          onAlertDialogOpen={() => setDialogState({ ...dialogState, isCancelProposalOpen: true })}
          onAlertDialogClose={() => setDialogState({ ...dialogState, isCancelProposalOpen: false })}
        />
        <Button variant="primary" onClick={() => handleClickExecuteTransaction()}>
          Execute
        </Button>
      </Flex>
    ),
    [ProposalStatus.Success]: <></>,
    [ProposalStatus.Failed]: <></>,
  };
  const { yes = 0, no = 0, abstain = 0, max = 0, turnout = 0, remaining = 0, quorum = 0 } = proposal.votes ?? {};

  const getVotesPercentage = (votesCount: number) => {
    if (max === 0 || !votesCount) {
      return 0;
    }
    return (votesCount / max) * 100;
  };

  const getVotesCount = (votesCount: number) => {
    if (max === 0 || !votesCount) {
      return 0;
    }
    if (votesCount > 1000) {
      return `${Math.round(votesCount / 1000).toFixed(2)}K`;
    }
    return votesCount;
  };

  return (
    <Flex layerStyle="content-box" direction="column" height="100%">
      <Flex direction="column" gap={4} minWidth="250px" height="100%">
        <Text textStyle="h4 medium">Vote details</Text>
        <Flex gap={2} justify="space-between" align="center">
          <Flex direction="column" alignItems="flex-start">
            <Text textStyle="p xsmall regular" color={Color.Grey_Blue._600} textAlign="start">
              Voting end time
            </Text>
            <Text textStyle="p xsmall semibold" color={Color.Grey_Blue._600} textAlign="start">
              {proposal.votingEndTime}
            </Text>
          </Flex>
          <Flex border={`1px solid ${Color.Success._600}`} paddingX={3} borderRadius={4} textAlign="center">
            <Text
              textStyle="p small medium"
              color={Color.Success._600}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              Turnout: {`${turnout}%`}
            </Text>
          </Flex>
        </Flex>
        <Flex direction="column" bg={Color.Grey_Blue._50} borderRadius="4px" padding="1rem" gap="4">
          <Box flex="4" margin="auto 1rem auto 0">
            <HorizontalStackBarChart
              quorum={getVotesPercentage(quorum)}
              stackBarHeight={12}
              data={[
                { value: yes ?? 0, bg: Color.Grey_Blue._300 },
                { value: no ?? 0, bg: Color.Grey_Blue._900 },
                { value: abstain ?? 0, bg: Color.Grey_Blue._600 },
                { value: remaining ?? 0, bg: Color.Grey_01 },
              ]}
            />
          </Box>
          <SimpleGrid minWidth="100%" columns={2} spacingX="2rem" spacingY="1.2rem">
            <Flex direction="column">
              <Flex gap={1} alignItems="center">
                <Box bg={Color.Grey_Blue._300} width="0.75rem" height="0.75rem"></Box>
                <Text textStyle="p small semibold" color={Color.Neutral._600}>
                  Yes
                </Text>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text textStyle="p small semibold" color={Color.Neutral._900}>{`${getVotesPercentage(yes).toFixed(
                  2
                )}%`}</Text>
                <Text textStyle="p small regular" color={Color.Neutral._400}>{`${getVotesCount(yes)}`}</Text>
              </Flex>
            </Flex>
            <Flex direction="column">
              <Flex gap={1} alignItems="center">
                <Box bg={Color.Grey_Blue._900} width="0.75rem" height="0.75rem"></Box>
                <Text textStyle="p small semibold" color={Color.Neutral._600}>
                  No
                </Text>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text textStyle="p small semibold" color={Color.Neutral._900}>{`${getVotesPercentage(no).toFixed(
                  2
                )}%`}</Text>
                <Text textStyle="p small regular" color={Color.Neutral._400}>{`${getVotesCount(no)}`}</Text>
              </Flex>
            </Flex>
            <Flex direction="column">
              <Flex gap={1} alignItems="center">
                <Box bg={Color.Grey_Blue._600} width="0.75rem" height="0.75rem"></Box>
                <Text textStyle="p small semibold" color={Color.Neutral._600}>
                  Abstain
                </Text>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text textStyle="p small semibold" color={Color.Neutral._900}>
                  {`${getVotesPercentage(abstain).toFixed(2)}%`}
                </Text>
                <Text textStyle="p small regular" color={Color.Neutral._400}>
                  {`${getVotesCount(abstain)}`}
                </Text>
              </Flex>
            </Flex>
            <Flex direction="column">
              <Flex gap={1} alignItems="center">
                <Box bg={Color.Grey_01} width="0.75rem" height="0.75rem"></Box>
                <Text textStyle="p small semibold" color={Color.Neutral._600}>
                  Remaining
                </Text>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text textStyle="p small semibold" color={Color.Neutral._900}>
                  {`${getVotesPercentage(remaining).toFixed(2)}%`}
                </Text>
                <Text textStyle="p small regular" color={Color.Neutral._400}>
                  {`${getVotesCount(remaining)}`}
                </Text>
              </Flex>
            </Flex>
          </SimpleGrid>
        </Flex>
        <Flex direction="column" gap={1}>
          <Flex justify="center" align="center" color={Color.Neutral._500} gap={1}>
            <LightningBoltIcon />
            <Text textStyle="p overline small">Voting Power</Text>
          </Flex>
          <Flex align="center" justify="center" gap={1}>
            <Text textStyle="h4 medium" color={Color.Primary._600}>
              {votingPower}
            </Text>
            <Text textStyle="p small medium" color={Color.Primary._600}>
              GOV
            </Text>
          </Flex>
        </Flex>
        {ConfirmationDetailsButtons[status]}
      </Flex>
    </Flex>
  );
}
