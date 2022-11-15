import { Text, Box, Flex, Spacer, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Card, HorizontalStackBarChart } from "../../../dex-ui-components";
import { Color } from "../../../dex-ui-components/themes";
import { ProposalStatus, ProposalState } from "../../store/governanceSlice";
import { FormattedProposal } from "./types";

interface ProposalCardProps {
  proposal: FormattedProposal;
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;
  const navigate = useNavigate();

  const getStatusColor = (status: ProposalStatus | undefined, state: ProposalState | undefined): string => {
    if (status === ProposalStatus.Active) {
      if (state === ProposalState.Active || state === ProposalState.Pending) {
        return Color.Teal_02;
      }
    }
    if (status === ProposalStatus.Passed && state === ProposalState.Queued) {
      return Color.Yellow_02;
    }
    if (status === ProposalStatus.Passed) {
      if (state === ProposalState.Executed || state === ProposalState.Succeeded) {
        return Color.Green_02;
      }
    }
    if (status === ProposalStatus.Failed) {
      if (state === ProposalState.Canceled || state === ProposalState.Expired || state === ProposalState.Defeated) {
        return Color.Red_02;
      }
    }
    return "";
  };

  const statusColor = getStatusColor(proposal.status, proposal.state);

  return (
    <Card
      variant="proposal-card"
      borderRadius="0px"
      padding="0.25rem"
      onClick={() => navigate(`/governance/proposal-details/${proposal.id}`)}
    >
      <Flex gap="8">
        <Box bg={statusColor} width="0.25rem"></Box>
        <Flex direction="column" alignItems="start" justifyContent="center" flex="2" gap="1">
          <Text textStyle="h4" color={statusColor}>
            {proposal.status}
          </Text>
          <Text textStyle="b3" color={statusColor}>
            {proposal.status === ProposalStatus.Active ? proposal.timeRemaining : proposal.state}
          </Text>
        </Flex>
        <Box flex="12" padding="0.5rem 0">
          <VStack alignItems="start">
            <Flex width="100%" flexDirection="row">
              <Text flex="4" textStyle="h3" textAlign="left">
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
        <Box flex="4" margin="auto 1rem auto 0">
          <HorizontalStackBarChart
            quorum={Number(proposal.votes.quorum)}
            data={[
              { value: proposal.votes.yes ?? 0, bg: Color.Green_01 },
              { value: proposal.votes.no ?? 0, bg: Color.Red_01 },
              { value: proposal.votes.abstain ?? 0, bg: Color.Blue_02 },
              { value: proposal.votes.remaining ?? 0, bg: Color.Grey_01 },
            ]}
          />
        </Box>
      </Flex>
    </Card>
  );
};
