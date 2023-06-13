import { Text, Flex } from "@chakra-ui/react";
import { Tag, Color, HorizontalStackBarChart, Metrics } from "@dex-ui-components";
import { ProposalStatusAsTagVariant } from "../constants";
import { ProposalStatus } from "@hooks";
import { ProposalDetailsControls, UseProposalDetailsData } from "@dex-ui/pages/ProposalDetails/ProposalDetailsControls";
import { isNotNil } from "ramda";
import { formatProposal } from "@dex-ui/pages/Governance/formatter";

interface ProposalVoteDetailsProps {
  proposalDetails: UseProposalDetailsData;
  resetServerState: () => void;
  status: ProposalStatus;
}

export function ProposalVoteDetails(props: ProposalVoteDetailsProps) {
  const { proposalDetails, resetServerState, status } = props;
  const proposal = proposalDetails.proposal.data;

  if (isNotNil(proposal)) {
    const formattedProposal = formatProposal(proposal);
    const { timeRemaining, votes } = formattedProposal;
    return (
      <Flex layerStyle="content-box" direction="column" height="100%">
        <Flex direction="column" gap="8" minWidth="250px" height="100%">
          <Flex justifyContent="space-between" gap="1">
            <Text textStyle="h4 medium">Vote details</Text>
            <Tag variant={ProposalStatusAsTagVariant[status]} />
          </Flex>
          <Flex direction="row" alignItems="center" gap="2">
            <Text textStyle="p xsmall regular">Time Remaining:</Text>
            <Text textStyle="p small semibold">{timeRemaining}</Text>
          </Flex>
          <Flex direction="column" bg={Color.Grey_Blue._50} borderRadius="4px" padding="1rem" gap="4">
            <Flex direction="column" justifyContent="space-between" gap="4">
              <HorizontalStackBarChart
                quorum={votes.quorum}
                data={[
                  { value: votes.yes ?? 0, bg: Color.Grey_Blue._300 },
                  { value: votes.no ?? 0, bg: Color.Grey_Blue._900 },
                  { value: votes.abstain ?? 0, bg: Color.Grey_Blue._600 },
                  { value: votes.remaining ?? 0, bg: Color.Grey_01 },
                ]}
              />
              {Number(votes.yes) < Number(votes.quorum) ? <Text textStyle="h4">Quorum Not Met</Text> : <></>}
              <Metrics
                rows={1}
                data={[
                  {
                    label: "Yes",
                    value: votes.yes ?? 0,
                    color: Color.Grey_Blue._300,
                  },
                  {
                    label: "No",
                    value: votes.no ?? 0,
                    color: Color.Grey_Blue._900,
                  },
                  {
                    label: "Abstain",
                    value: votes.abstain ?? 0,
                    color: Color.Grey_Blue._600,
                  },
                ]}
              />
            </Flex>
          </Flex>
          <ProposalDetailsControls proposalDetails={proposalDetails} resetServerState={resetServerState} />
        </Flex>
      </Flex>
    );
  }
  return <></>;
}
