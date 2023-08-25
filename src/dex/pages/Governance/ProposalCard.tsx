import { Text, Box, Flex, Spacer, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ProposalStatus } from "../../store/governanceSlice";
import { getStatusColor, getShortDescription } from "../../utils";
import { FormattedProposal } from "./types";
import { Popover, Tag, Card, HorizontalStackBarChart, Color } from "@shared/ui-kit";

interface ProposalCardProps {
  proposal: FormattedProposal;
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;
  const navigate = useNavigate();

  const statusColor = getStatusColor(proposal.status, proposal.state);

  return (
    /** TODO: Update UI Library Card component to accept style variants. */
    <Card
      variant="proposal-card"
      height="99px"
      minHeight="99px"
      borderRadius="0px"
      padding="0.25rem"
      onClick={() => navigate(`proposal-details/${proposal.id}`)}
    >
      <Flex gap="8" alignItems="center" height="100%">
        <Box bg={statusColor} width="0.25rem" height="100%"></Box>
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
              <Flex flex="12" textAlign="left" alignItems="center">
                <Text
                  textStyle="h3"
                  paddingRight="0.5rem"
                  maxWidth="500px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {proposal.title}
                </Text>
                <Tag label={proposal.type} />
              </Flex>
              <Spacer flex="1" />
              <Text flex="4" textAlign="right" textStyle="b2">{`Author ${proposal.author.toString()}`}</Text>
            </Flex>
            <Text textStyle="b2" textAlign="left">
              {getShortDescription(proposal.description)}
            </Text>
          </VStack>
        </Box>
        <Popover
          triggerType="hover"
          data={[
            { value: proposal.votes.yes ?? 0, label: "Yes" },
            { value: proposal.votes.no ?? 0, label: "No" },
            { value: proposal.votes.abstain ?? 0, label: "Abstain" },
            { value: proposal.votes.remaining ?? 0, label: "Remaining" },
          ]}
          triggerBody={
            <Box flex="4" margin="auto 1rem auto 0">
              <HorizontalStackBarChart
                quorum={proposal.votes.quorum}
                data={[
                  { value: proposal.votes.yes ?? 0, bg: Color.Blue_01 },
                  { value: proposal.votes.no ?? 0, bg: Color.Red_03 },
                  { value: proposal.votes.abstain ?? 0, bg: Color.Grey_03 },
                  { value: proposal.votes.remaining ?? 0, bg: Color.Grey_01 },
                ]}
              />
            </Box>
          }
        ></Popover>
      </Flex>
    </Card>
  );
};
