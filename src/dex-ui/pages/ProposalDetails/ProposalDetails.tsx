import { ExternalLinkIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Link,
  Card,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  Box,
  Spacer,
  Skeleton,
  SkeletonText,
  HStack,
  Tag,
} from "@chakra-ui/react";
import { isNil } from "ramda";
import { useState } from "react";
import { Link as ReachLink, useParams } from "react-router-dom";
import {
  AlertDialog,
  Color,
  HorizontalStackBarChart,
  LoadingDialog,
  Metrics,
  NotficationTypes,
  Notification,
} from "../../../dex-ui-components";
import { useDexContext, useHasVoted, useCastVote, useExecuteProposal, useProposal } from "../../hooks";
import { ProposalState, ProposalStatus } from "../../store/governanceSlice";
import { createHashScanLink, getStatusColor } from "../../utils";
import { ConfirmVoteModalBody } from "./ConfirmVoteModalBody";
import { VoteType } from "./types";

export const ProposalDetails = () => {
  const { id } = useParams();
  const [dialogState, setDialogState] = useState({
    isErrorDialogOpen: false,
    isVoteYesOpen: false,
    isVoteNoOpen: false,
    isVoteAbstainOpen: false,
  });
  const { wallet, governance } = useDexContext(({ wallet, governance }) => ({ wallet, governance }));
  const proposal = useProposal(id);
  const castVote = useCastVote();
  const hasVoted = useHasVoted(proposal.data?.contractId, proposal.data?.id, wallet.getSigner());
  const executeProposal = useExecuteProposal();

  if (!proposal.isLoading && isNil(proposal.data)) {
    return <span>{`Proposal with id: ${id} not found.`}</span>;
  }

  if (proposal.isError) {
    return <span>Error: {proposal.error.message}</span>;
  }

  const castVoteTransactionId = castVote.data?.transactionId.toString();
  const castVoteHashScanLink = createHashScanLink(castVoteTransactionId);
  const executeProposalTransactionId = executeProposal.data?.transactionId.toString();
  const executeProposalHashScanLink = createHashScanLink(executeProposalTransactionId);

  const areButtonsHidden = proposal.isLoading || castVote.isLoading || proposal.data?.status === ProposalStatus.Failed;
  const isHasVotedMessageVisible = hasVoted.data && proposal.data?.status === ProposalStatus.Active;
  const areVoteButtonsVisible = !hasVoted.data && proposal.data?.status === ProposalStatus.Active;
  const isExecuteButtonVisible =
    proposal.data?.status === ProposalStatus.Passed && proposal.data?.state !== ProposalState.Executed;
  const isClaimTokenButtonVisible = proposal.data?.state === ProposalState.Executed;
  const statusColor = getStatusColor(proposal.data?.status, proposal.data?.state);

  const handleExecuteClicked = async () => {
    const signer = wallet.getSigner();
    executeProposal.mutate({ contractId: proposal.data?.contractId ?? "", title: proposal.data?.title ?? "", signer });
  };

  const handleClaimGODTokensClicked = async () => {
    /** TODO: Refactor using a react-query hook */
    await governance.claimGODTokens(proposal.data?.contractId ?? "", proposal.data?.id ?? "");
  };

  const handleVoteButtonClicked = (voteType: VoteType) => {
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
  };

  const handleVoteYesClicked = () => handleVoteButtonClicked(VoteType.For);
  const handleVoteNoClicked = () => handleVoteButtonClicked(VoteType.Against);
  const handleVoteAbstainClicked = () => handleVoteButtonClicked(VoteType.Abstain);
  const handleErrorDialogDismissButtonClicked = () => {
    castVote.reset();
    executeProposal.reset();
  };
  const handleNotificationCloseButtonClicked = () => {
    castVote.reset();
    executeProposal.reset();
  };

  return (
    <>
      <Grid templateColumns="repeat(4, 1fr)" gap="4" width="100%" minHeight="500px">
        <GridItem colSpan={3}>
          <Flex direction="column" gap={10} height="100%">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReachLink} to="/governance">
                  <Text textStyle="link">{"< Governance"}</Text>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            {/** TODO: Refactor to dedupe Notification component usage. */}
            <Notification
              type={NotficationTypes.SUCCESS}
              /** TODO: Add logic to display what type of vote the user casted. */
              message={`Your vote has been submitted.`}
              isLinkShown={true}
              linkText="View in HashScan"
              linkRef={castVoteHashScanLink}
              isCloseButtonShown={true}
              isVisible={castVote.isSuccess}
              handleClickClose={handleNotificationCloseButtonClicked}
            />
            <Notification
              type={NotficationTypes.SUCCESS}
              message={`The ${proposal.data?.title} proposal has been executed.`}
              isLinkShown={true}
              linkText="View in HashScan"
              linkRef={executeProposalHashScanLink}
              isCloseButtonShown={true}
              isVisible={executeProposal.isSuccess}
              handleClickClose={handleNotificationCloseButtonClicked}
            />
            <Box>
              <Skeleton speed={0.4} fadeDuration={0} width="fit-content" isLoaded={!proposal.isLoading}>
                <Text textStyle="h2" paddingRight="0.25rem">
                  {proposal.data?.title}
                </Text>
              </Skeleton>
              <Spacer padding="0.25rem" />
              <Flex direction="row" alignItems="flex-end">
                <Text alignSelf="center" textStyle="b2" paddingRight="0.25rem">
                  Type:
                </Text>
                <Tag textStyle="b3" size="sm" padding="0.3rem">
                  {proposal.data?.type}
                </Tag>
              </Flex>
              <Spacer padding="0.25rem" />
              <Flex flexWrap="wrap" width="100%">
                <Text alignSelf="center" textStyle="b2">
                  Authored by &nbsp;
                </Text>
                <Skeleton speed={0.4} fadeDuration={0} isLoaded={!proposal.isLoading}>
                  <Link
                    width="fit-content"
                    display="flex"
                    alignItems="center"
                    color="#0180FF"
                    // href={linkRef}
                    isExternal
                  >
                    <Text textDecoration="underline">{proposal.data?.author}</Text>
                    <ExternalLinkIcon margin="0rem 0.125rem" />
                  </Link>
                </Skeleton>
              </Flex>
            </Box>
            {proposal.data?.state === ProposalState.Executed && (
              <Tag textStyle="b3" size="sm" bg={Color.Green_01_Opaque} padding="0.3rem" width="fit-content">
                {ProposalState.Executed}
              </Tag>
            )}
            <Box flexGrow="1">
              <Text textStyle="h3">Description</Text>
              <Spacer padding="0.25rem" />
              <SkeletonText speed={0.4} fadeDuration={0} noOfLines={12} isLoaded={!proposal.isLoading}>
                <Text textStyle="b2">{proposal.data?.description}</Text>
              </SkeletonText>
            </Box>
            <Flex gap="4" direction="column">
              {/** Refactor to separate layout component. */}
              {areButtonsHidden ? (
                <></>
              ) : (
                <>
                  {isHasVotedMessageVisible && (
                    <>
                      <Text textStyle="h3">Vote on Proposal</Text>
                      <Text textStyle="b2">You have voted on this proposal.</Text>
                    </>
                  )}
                  {isExecuteButtonVisible && (
                    <Button variant="primary" width="290px" onClick={handleExecuteClicked}>
                      Execute
                    </Button>
                  )}
                  {isClaimTokenButtonVisible && (
                    <Button variant="primary" width="290px" onClick={handleClaimGODTokensClicked}>
                      Claim Governance Tokens
                    </Button>
                  )}
                  {areVoteButtonsVisible && (
                    <>
                      <Text textStyle="h3">Vote on Proposal</Text>
                      <Flex gap="4">
                        <AlertDialog
                          openDialogButtonStyles={{ flex: "1" }}
                          openDialogButtonText="Yes"
                          isOpenDialogButtonDisabled={proposal === undefined}
                          title="Confirm Vote"
                          body={ConfirmVoteModalBody()}
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
                          body={ConfirmVoteModalBody()}
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
                          body={ConfirmVoteModalBody()}
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
                    </>
                  )}
                </>
              )}
            </Flex>
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction="column" gap="2">
            <Button variant="secondary">View Discussion</Button>
            <Card
              bg={Color.White_01}
              border={`0.25px solid ${Color.Grey_01}`}
              borderRadius="2px"
              padding="0.5rem"
              boxShadow="none"
            >
              <Text textStyle="h3">Status</Text>
              <Spacer padding="0.5rem" />
              <HStack>
                {/**
                 * TODO: Create state mapping between proposal state and UI state.
                 * e.g., The proposal do not have the concept of a 'Queued to Execute' state.
                 */}
                <Text textStyle="b2" color={statusColor}>
                  {proposal.data?.state === ProposalState.Executed ? ProposalState.Executed : proposal.data?.status}
                </Text>
                <Text textStyle="b2" color={Color.Grey_02}>
                  - {proposal.data?.timeRemaining}
                </Text>
              </HStack>
            </Card>
            <Card
              bg={Color.White_01}
              border={`0.25px solid ${Color.Grey_01}`}
              borderRadius="2px"
              padding="0.75rem"
              boxShadow="none"
            >
              <Flex direction="column" gap="4">
                <Text textStyle="h3">Votes</Text>
                <Spacer padding="0.5rem 0" />
                <HorizontalStackBarChart
                  quorum={Number(proposal.data?.votes.quorum)}
                  data={[
                    { value: proposal.data?.votes.yes ?? 0, bg: Color.Green_01 },
                    { value: proposal.data?.votes.no ?? 0, bg: Color.Red_01 },
                    { value: proposal.data?.votes.abstain ?? 0, bg: Color.Blue_02 },
                    { value: proposal.data?.votes.remaining ?? 0, bg: Color.Grey_01 },
                  ]}
                />
                {Number(proposal.data?.votes.yes) < Number(proposal.data?.votes.quorum) ? (
                  <Text textStyle="h4">Quorum Not Met</Text>
                ) : (
                  <></>
                )}
                <Box width="90%">
                  <Metrics
                    rows={2}
                    data={[
                      { label: "Yes", value: proposal.data?.votes.yes ?? 0, color: Color.Green_01 },
                      { label: "No", value: proposal.data?.votes.no ?? 0, color: Color.Red_01 },
                      { label: "Abstain", value: proposal.data?.votes.abstain ?? 0, color: Color.Blue_02 },
                      { label: "Remain", value: proposal.data?.votes.remaining ?? 0, color: Color.Grey_01 },
                    ]}
                  />
                </Box>
              </Flex>
            </Card>
          </Flex>
        </GridItem>
      </Grid>
      {/** TODO: Refactor to dynamically accept loading and loading message states */}
      <LoadingDialog isOpen={castVote.isLoading} message={"Please confirm the vote in your wallet to proceed"} />
      <LoadingDialog
        isOpen={castVote.isError}
        message={castVote.error?.message ?? ""}
        icon={<WarningIcon h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: handleErrorDialogDismissButtonClicked,
        }}
      />
      <LoadingDialog
        isOpen={executeProposal.isLoading}
        message={"Please confirm the proposal execution in your wallet to proceed"}
      />
      <LoadingDialog
        isOpen={executeProposal.isError}
        message={executeProposal.error?.message ?? ""}
        icon={<WarningIcon h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: handleErrorDialogDismissButtonClicked,
        }}
      />
    </>
  );
};
