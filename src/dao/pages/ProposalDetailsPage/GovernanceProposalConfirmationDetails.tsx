import { Box, Flex, Button, SimpleGrid } from "@chakra-ui/react";
import {
  Text,
  Color,
  CheckCircleUnfilledIcon,
  LightningBoltIcon,
  AlertDialog,
  HorizontalStackBarChart,
  InlineAlert,
  InlineAlertType,
} from "@shared/ui-kit";
import { VoteType } from "@dex/pages";
import { TransactionResponse } from "@hashgraph/sdk";
import {
  GovernanceMutations,
  UseCancelProposalParams,
  UseCastVoteParams,
  useDexContext,
  UseExecuteProposalParams,
  usePairedWalletDetails,
} from "@dex/hooks";
import {
  GOVUpgradeProposalDetails,
  Proposal,
  ProposalStatus,
  UseChangeAdminMutationResult,
  useFetchContract,
} from "@dao/hooks";
import { useState } from "react";
import { UseMutationResult } from "react-query";
import { ProposalVoteModal } from "./ProposalVoteModal";
import { ProposalCancelModal } from "./ProposalDetailsComponents";
import { ProposalState } from "@dex/store";

interface GovernanceProposalConfirmationDetailsProps {
  proposal: Proposal;
  status: ProposalStatus;
  state?: ProposalState;
  msgValue: number;
  hexStringData: string;
  operation: number;
  nonce: number;
  tokenSymbol: string;
  votingPower: string;
  contractUpgradeLogic: string;
  assetHolderContractId: string;
  hasConnectedWalletVoted: boolean;
  isAuthor: boolean;
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
  changeAdminMutation: UseChangeAdminMutationResult;
}

export function GovernanceProposalConfirmationDetails(props: GovernanceProposalConfirmationDetailsProps) {
  const [dialogState, setDialogState] = useState({
    isVoteOpen: false,
    isCancelProposalOpen: false,
  });
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const { walletId } = usePairedWalletDetails();
  const {
    proposal,
    tokenSymbol,
    votingPower,
    castVote,
    executeProposal,
    cancelProposal,
    changeAdminMutation,
    contractUpgradeLogic,
    assetHolderContractId,
    status,
    state,
    hasConnectedWalletVoted,
    isAuthor,
  } = props;

  const contractEvmAddress = proposal?.contractEvmAddress ?? "";
  const contractIdQueryResults = useFetchContract(contractEvmAddress);
  const contractId = contractIdQueryResults.data?.data.contract_id ?? "";
  const isVotingDisabled = !proposal || isNaN(Number(votingPower)) || Number(votingPower) <= 0;
  const isAdminApprovalButtonVisible =
    (proposal?.data as GOVUpgradeProposalDetails)?.isAdminApprovalButtonVisible ?? false;
  const isApproveAdminButtonDisabled = walletId !== (proposal?.data as GOVUpgradeProposalDetails)?.proxyAdmin;
  const isContractUpgradeProposal = proposal?.isContractUpgradeProposal;

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
        proposal: proposal,
        signer,
        transfersFromAccount: proposal.sender,
        tokenId: proposal.tokenId,
        tokenAmount: proposal.amount,
      });
    }
  }

  async function handleClickChangeAdminTransaction(governorUpgradeLogic: string, proxyAddress: string) {
    changeAdminMutation.mutate({ safeAccountId: governorUpgradeLogic, proxyAddress });
  }

  function handleCancelProposalClicked() {
    resetServerState();
    if (proposal) {
      const signer = wallet.getSigner();
      cancelProposal.mutate({
        contractId: contractId,
        proposal: proposal,
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
    [ProposalStatus.Pending]: (
      <Flex direction="column" gap={2}>
        {isContractUpgradeProposal ? (
          isAdminApprovalButtonVisible ? (
            <Flex direction="column" gap="1rem">
              <Button
                variant="primary"
                isDisabled={isApproveAdminButtonDisabled}
                onClick={() => {
                  handleClickChangeAdminTransaction(
                    contractUpgradeLogic,
                    (proposal?.data as GOVUpgradeProposalDetails)?.proxy ?? ""
                  );
                }}
              >
                Transfer Ownership
              </Button>
              <InlineAlert
                type={InlineAlertType.Warning}
                message={`Connect your wallet with 
                ${(proposal?.data as GOVUpgradeProposalDetails)?.proxyAdmin} 
                to approve the transfer of ownership to ${assetHolderContractId}`}
              />
            </Flex>
          ) : hasConnectedWalletVoted ? (
            <Button isDisabled leftIcon={<CheckCircleUnfilledIcon boxSize={4} />}>
              You have voted
            </Button>
          ) : (
            <>
              <Flex gap="4">
                <AlertDialog
                  openDialogButtonStyles={{ flex: "1" }}
                  openDialogButtonText="Vote"
                  isOpenDialogButtonDisabled={isVotingDisabled}
                  title="Confirm Vote"
                  body={
                    <ProposalVoteModal
                      tokenSymbol={tokenSymbol}
                      votingPower={votingPower}
                      handleVoteButtonClicked={handleVoteButtonClicked}
                    />
                  }
                  alertDialogOpen={dialogState.isVoteOpen}
                  onAlertDialogOpen={() => setDialogState({ ...dialogState, isVoteOpen: true })}
                  onAlertDialogClose={() => setDialogState({ ...dialogState, isVoteOpen: false })}
                />
              </Flex>
            </>
          )
        ) : (
          <>
            {hasConnectedWalletVoted ? (
              <Button isDisabled leftIcon={<CheckCircleUnfilledIcon boxSize={4} />}>
                You have voted
              </Button>
            ) : (
              <>
                <Flex gap="4">
                  <AlertDialog
                    openDialogButtonStyles={{ flex: "1" }}
                    openDialogButtonText="Vote"
                    isOpenDialogButtonDisabled={isVotingDisabled}
                    title="Confirm Vote"
                    body={
                      <ProposalVoteModal
                        tokenSymbol={tokenSymbol}
                        votingPower={votingPower}
                        handleVoteButtonClicked={handleVoteButtonClicked}
                      />
                    }
                    alertDialogOpen={dialogState.isVoteOpen}
                    onAlertDialogOpen={() => setDialogState({ ...dialogState, isVoteOpen: true })}
                    onAlertDialogClose={() => setDialogState({ ...dialogState, isVoteOpen: false })}
                  />
                </Flex>
              </>
            )}
          </>
        )}
        {isAuthor ? (
          <ProposalCancelModal
            title={proposal?.title}
            tokenSymbol={tokenSymbol}
            votingPower={votingPower}
            handleCancelProposalClicked={handleCancelProposalClicked}
            setDialogState={setDialogState}
            dialogState={dialogState}
          />
        ) : (
          <></>
        )}
      </Flex>
    ),
    [ProposalStatus.Queued]: (
      <>
        <Button variant="primary" onClick={() => handleClickExecuteTransaction()}>
          Execute
        </Button>
        {isAuthor && (
          <ProposalCancelModal
            title={proposal?.title}
            tokenSymbol={tokenSymbol}
            votingPower={votingPower}
            handleCancelProposalClicked={handleCancelProposalClicked}
            setDialogState={setDialogState}
            dialogState={dialogState}
          />
        )}
      </>
    ),
    [ProposalStatus.Success]: <></>,
    [ProposalStatus.Failed]: (
      <>
        {isAuthor && state !== ProposalState.Canceled ? (
          <ProposalCancelModal
            title={proposal?.title}
            tokenSymbol={tokenSymbol}
            votingPower={votingPower}
            handleCancelProposalClicked={handleCancelProposalClicked}
            setDialogState={setDialogState}
            dialogState={dialogState}
          />
        ) : (
          <></>
        )}
      </>
    ),
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
  const votingEndTime = new Date(Number(proposal.votingEndTime) * 1000).toLocaleString();
  return (
    <Flex layerStyle="content-box" direction="column" height="100%">
      <Flex direction="column" gap={4} minWidth="250px" height="100%">
        <Text.H4_Medium>Vote details</Text.H4_Medium>
        <Flex gap={2} justify="space-between" align="center">
          <Flex direction="column" alignItems="flex-start">
            <Text.P_XSmall_Regular color={Color.Grey_Blue._600} textAlign="start">
              Voting end time
            </Text.P_XSmall_Regular>
            <Text.P_XSmall_Semibold color={Color.Grey_Blue._600} textAlign="start">
              {votingEndTime}
            </Text.P_XSmall_Semibold>
          </Flex>
          <Flex border={`1px solid ${Color.Success._600}`} paddingX={3} borderRadius={4} textAlign="center">
            <Text.P_Small_Medium
              color={Color.Success._600}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              Turnout: {`${turnout}%`}
            </Text.P_Small_Medium>
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
                <Text.P_Small_Semibold color={Color.Neutral._600}>Yes</Text.P_Small_Semibold>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text.P_Small_Semibold color={Color.Neutral._900}>{`${getVotesPercentage(yes).toFixed(
                  2
                )}%`}</Text.P_Small_Semibold>
                <Text.P_Small_Regular color={Color.Neutral._400}>{`${getVotesCount(yes)}`}</Text.P_Small_Regular>
              </Flex>
            </Flex>
            <Flex direction="column">
              <Flex gap={1} alignItems="center">
                <Box bg={Color.Grey_Blue._900} width="0.75rem" height="0.75rem"></Box>
                <Text.P_Small_Semibold color={Color.Neutral._600}>No</Text.P_Small_Semibold>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text.P_Small_Semibold color={Color.Neutral._900}>{`${getVotesPercentage(no).toFixed(
                  2
                )}%`}</Text.P_Small_Semibold>
                <Text.P_Small_Regular color={Color.Neutral._400}>{`${getVotesCount(no)}`}</Text.P_Small_Regular>
              </Flex>
            </Flex>
            <Flex direction="column">
              <Flex gap={1} alignItems="center">
                <Box bg={Color.Grey_Blue._600} width="0.75rem" height="0.75rem"></Box>
                <Text.P_Small_Semibold color={Color.Neutral._600}>Abstain</Text.P_Small_Semibold>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text.P_Small_Semibold color={Color.Neutral._900}>
                  {`${getVotesPercentage(abstain).toFixed(2)}%`}
                </Text.P_Small_Semibold>
                <Text.P_Small_Regular color={Color.Neutral._400}>{`${getVotesCount(abstain)}`}</Text.P_Small_Regular>
              </Flex>
            </Flex>
            <Flex direction="column">
              <Flex gap={1} alignItems="center">
                <Box bg={Color.Grey_01} width="0.75rem" height="0.75rem"></Box>
                <Text.P_Small_Semibold color={Color.Neutral._600}>Remaining</Text.P_Small_Semibold>
              </Flex>
              <Flex gap={1} alignItems="center">
                <Text.P_Small_Semibold color={Color.Neutral._900}>
                  {`${getVotesPercentage(remaining).toFixed(2)}%`}
                </Text.P_Small_Semibold>
                <Text.P_Small_Regular color={Color.Neutral._400}>{`${getVotesCount(remaining)}`}</Text.P_Small_Regular>
              </Flex>
            </Flex>
          </SimpleGrid>
        </Flex>
        <Flex direction="column" gap={1}>
          <Flex justify="center" align="center" color={Color.Neutral._500} gap={1}>
            <LightningBoltIcon />
            <Text.Overline_Small>Voting Power</Text.Overline_Small>
          </Flex>
          <Flex align="center" justify="center" gap={1}>
            <Text.H4_Medium color={Color.Primary._600}>{votingPower}</Text.H4_Medium>
            <Text.P_Small_Medium color={Color.Primary._600}>{tokenSymbol}</Text.P_Small_Medium>
          </Flex>
        </Flex>
        {ConfirmationDetailsButtons[status]}
      </Flex>
    </Flex>
  );
}
