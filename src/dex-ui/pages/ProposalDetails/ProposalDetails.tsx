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
import { useState } from "react";
import { Link as ReachLink, useParams } from "react-router-dom";
import { AlertDialog, Color, HorizontalStackBarChart, LoadingDialog, Metrics } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { ProposalStatus } from "../../store/governanceSlice";
import { formatProposal } from "../Governance/formatter";
import { ConfirmVoteModalBody } from "./ConfirmVoteModalBody";
import { VoteType } from "./types";

export const ProposalDetails = () => {
  const { id } = useParams();
  // useGovernanceData();
  const [dialogState, setDialogState] = useState({
    isErrorDialogOpen: false,
    isVoteYesOpen: false,
    isVoteNoOpen: false,
    isVoteAbstainOpen: false,
  });
  const { app, governance } = useDexContext(({ app, governance }) => ({ app, governance }));
  if (id === undefined) {
    return <>No proposal ID provided</>;
  }
  const proposal = governance.fetchProposal(id);
  const formattedProposal = proposal ? formatProposal(proposal) : proposal;
  const isExecuteButtonVisible = formattedProposal?.status === ProposalStatus.Passed;

  const handleExecuteClicked = async () => {
    await governance.executeProposal(proposal?.contractId ?? "", proposal?.title ?? "");
  };

  const castVote = async (voteType: VoteType) => {
    if (formattedProposal) {
      await governance.castVote(formattedProposal.contractId, formattedProposal.id, voteType);
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

  const handleVoteYesClicked = () => castVote(VoteType.For);
  const handleVoteNoClicked = () => castVote(VoteType.Against);
  const handleVoteAbstainClicked = () => castVote(VoteType.Abstain);

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
            {/**
             * TODO: Add Notfication alert message for proposal cancellation.
             */}
            <Box>
              <Skeleton
                speed={0.4}
                fadeDuration={0}
                width="fit-content"
                isLoaded={formattedProposal && !app.isFeatureLoading("proposals")}
              >
                <Text textStyle="h2" paddingRight="0.25rem">
                  {formattedProposal?.title}
                </Text>
              </Skeleton>
              <Spacer padding="0.25rem" />
              <Flex direction="row" alignItems="flex-end">
                <Text alignSelf="center" textStyle="b2" paddingRight="0.25rem">
                  Type:
                </Text>
                <Tag textStyle="b3" size="sm" maxHeight="0.5rem">
                  {formattedProposal?.type}
                </Tag>
              </Flex>
              <Spacer padding="0.25rem" />
              <Flex flexWrap="wrap" width="100%">
                <Text alignSelf="center" textStyle="b2">
                  Authored by &nbsp;
                </Text>
                <Skeleton
                  speed={0.4}
                  fadeDuration={0}
                  isLoaded={formattedProposal && !app.isFeatureLoading("proposals")}
                >
                  <Link
                    width="fit-content"
                    display="flex"
                    alignItems="center"
                    color="#0180FF"
                    // href={linkRef}
                    isExternal
                  >
                    <Text textDecoration="underline">{formattedProposal?.author}</Text>
                    <ExternalLinkIcon margin="0rem 0.125rem" />
                  </Link>
                </Skeleton>
              </Flex>
            </Box>
            <Box flexGrow="1">
              <Text textStyle="h3">Description</Text>
              <Spacer padding="0.25rem" />
              <SkeletonText
                speed={0.4}
                fadeDuration={0}
                noOfLines={12}
                isLoaded={formattedProposal && !app.isFeatureLoading("proposals")}
              >
                <Text textStyle="b2">{formattedProposal?.description}</Text>
              </SkeletonText>
            </Box>
            <Flex gap="4" direction="column">
              {isExecuteButtonVisible ? (
                <Button variant="primary" width="290px" onClick={handleExecuteClicked}>
                  Execute
                </Button>
              ) : (
                <>
                  <Text textStyle="h3">Vote on Proposal</Text>
                  <Flex gap="4">
                    <AlertDialog
                      openDialogButtonStyles={{ flex: "1" }}
                      openDialogButtonText="Yes"
                      isOpenDialogButtonDisabled={formattedProposal === undefined}
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
                      isOpenDialogButtonDisabled={formattedProposal === undefined}
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
                      isOpenDialogButtonDisabled={formattedProposal === undefined}
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
                <Text textStyle="b2">{formattedProposal?.state}</Text>
                <Text textStyle="b2" color={Color.Grey_02}>
                  - {formattedProposal?.timeRemaining}
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
                  quorum={Number(formattedProposal?.votes.quorum)}
                  data={[
                    { value: formattedProposal?.votes.yes ?? 0, bg: Color.Green_01 },
                    { value: formattedProposal?.votes.no ?? 0, bg: Color.Red_01 },
                    { value: formattedProposal?.votes.abstain ?? 0, bg: Color.Blue_02 },
                    { value: formattedProposal?.votes.remaining ?? 0, bg: Color.Grey_01 },
                  ]}
                />
                {Number(formattedProposal?.votes.yes) < Number(formattedProposal?.votes.quorum) ? (
                  <Text textStyle="h4">Quorum Not Met</Text>
                ) : (
                  <></>
                )}
                <Box width="90%">
                  <Metrics
                    rows={2}
                    data={[
                      { label: "Yes", value: formattedProposal?.votes.yes ?? 0, color: Color.Green_01 },
                      { label: "No", value: formattedProposal?.votes.no ?? 0, color: Color.Red_01 },
                      { label: "Abstain", value: formattedProposal?.votes.abstain ?? 0, color: Color.Blue_02 },
                      { label: "Remain", value: formattedProposal?.votes.remaining ?? 0, color: Color.Grey_01 },
                    ]}
                  />
                </Box>
              </Flex>
            </Card>
          </Flex>
        </GridItem>
      </Grid>
      <LoadingDialog
        isOpen={governance.proposalTransacationState.status === "in progress"}
        message={"Please confirm the vote in your wallet to proceed"}
      />
      <LoadingDialog
        isOpen={governance.proposalTransacationState.status === "error" && dialogState.isErrorDialogOpen}
        message={governance.proposalTransacationState.errorMessage ?? ""}
        icon={<WarningIcon h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => setDialogState({ ...dialogState, isErrorDialogOpen: false }),
        }}
      />
    </>
  );
};
