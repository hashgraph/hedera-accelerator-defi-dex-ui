import { Text, Badge, Box, Flex, Spacer, VStack, Center } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Card, HorizontalStackBarChart, Metrics } from "../../../dex-ui-components";
import { ProposalStatus, ProposalState } from "../../store/governanceSlice";
import { FormattedProposal } from "./types";

interface ProposalCardProps {
  proposal: FormattedProposal;
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;
  const navigate = useNavigate();

  const getStatusColor = (status: ProposalStatus | undefined) => {
    if (status === ProposalStatus.Active) {
      return { bg: "rgba(109, 195, 209, 0.2)", color: "#31A9BD" };
    }
    if (status === ProposalStatus.Passed) {
      return { bg: "#E8F6DF", color: "#49A600" };
    }
    if (status === ProposalStatus.Failed) {
      return { bg: "#F2F2F4", color: "rgba(0, 0, 0, 0.7)" };
    }

    return { bg: "", color: "" };
  };

  const getStateColor = (state: ProposalState | undefined) => {
    if (state === ProposalState.Executed || state === ProposalState.Succeeded) {
      return { bg: "#E8F6DF", color: "#49A600" };
    }
    if (state === ProposalState.Pending || state === ProposalState.Queued) {
      return { bg: "rgba(252, 185, 13, 0.2)", color: "#DB9E00" };
    }
    if (state === ProposalState.Canceled || state === ProposalState.Expired) {
      return { bg: "rgba(242, 157, 151, 0.3)", color: "#FF1919" };
    }
    if (state === ProposalState.Defeated) {
      return { bg: "#E7E9EB;", color: "rgba(0, 0, 0, 0.56)" };
    }
    return { bg: "", color: "" };
  };

  const status = getStatusColor(proposal.status);
  const state = getStateColor(proposal.state);

  return (
    <Card variant="proposal-card" padding="0.75rem 0.25rem" onClick={() => navigate("/governance/proposal-details")}>
      <Flex>
        <Center flex="2">
          <VStack>
            <Badge padding="0.25rem 1rem" background={status.bg} color={status.color} borderRadius="50px">
              {proposal.status}
            </Badge>
            <Text>{proposal.timeRemaining}</Text>
          </VStack>
        </Center>
        <Spacer flex="0.5" />
        <Box flex="12">
          <VStack alignItems="start">
            <Flex width="100%" flexDirection="row">
              <Text flex="4" textStyle="b1-bold" textAlign="left">
                {proposal.title}
              </Text>
              <Spacer flex="1" />
              <Text flex="4" textAlign="right" textStyle="b2">{`Author ${proposal.author.toString()}`}</Text>
            </Flex>
            <Text textStyle="b2" textAlign="left">
              {proposal.description}
            </Text>
          </VStack>
        </Box>
        <Spacer flex="0.5" />
        <Box flex="4" marginRight="1rem">
          {proposal.state === ProposalState.Active ? (
            <VStack spacing={2} align="stretch">
              <Metrics
                flex="1"
                data={[
                  { value: proposal.voteCount.yes ?? 0, color: "#79B54B" },
                  { value: proposal.voteCount.no ?? 0, color: "#EE2B00" },
                  { value: proposal.voteCount.abstain ?? 0, color: "#000AFF" },
                  { value: proposal.voteCount.abstain ?? 0, color: "#DBDEDF" },
                ]}
              />
              <Spacer flex="10" />
              <HorizontalStackBarChart
                flex="1"
                data={[
                  { value: proposal.voteCount.yes ?? 0, bg: "#79B54B" },
                  { value: proposal.voteCount.no ?? 0, bg: "#EE2B00" },
                  { value: proposal.voteCount.abstain ?? 0, bg: "#000AFF" },
                  { value: proposal.voteCount.abstain ?? 0, bg: "#DBDEDF" },
                ]}
              />
            </VStack>
          ) : (
            <Badge
              float="right"
              padding="0.125rem 0.75rem"
              background={state.bg}
              color={state.color}
              borderRadius="20px"
            >
              {proposal.state}
            </Badge>
          )}
        </Box>
      </Flex>
    </Card>
  );
};
