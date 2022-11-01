import { AccountId } from "@hashgraph/sdk";
import { useNavigate } from "react-router-dom";
import { Text, Button, Flex, Spacer, VStack } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { Proposal } from "./types";

/** TODO: Replace will real data */
const mockProposalData: Proposal[] = [
  {
    title: "New Token Proposal 1",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Active",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 2",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Active",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 5",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Active",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 3",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
    adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Passed",
    timeRemaining: "12d 4 hrs",
    voteCount: {
      yes: 123,
      no: 462,
      abstain: 3000,
    },
  },
  {
    title: "New Token Proposal 4",
    description: `Preview of the description lorem ipsum dolor sit amit consectetur 
      adipiscing elit Phasellus congue, sapien eu...`,
    author: AccountId.fromString("0.0.34728121"),
    status: "Failed",
    timeRemaining: "6d 4 hrs",
    voteCount: {
      yes: 232,
      no: 212,
      abstain: 2203,
    },
  },
];

export const Governance = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Flex flexDirection="column" width="100%">
      <Text textStyle="h2">Governance</Text>
      <Spacer margin="1rem" />
      <Text textStyle="h3">Active Proposals</Text>
      <Spacer margin="0.5rem" />
      <VStack>
        {mockProposalData
          .filter((proposal) => proposal.status === "Active")
          .map((proposal, index) => (
            <ProposalCard proposal={proposal} key={index} />
          ))}
      </VStack>
      <Spacer margin="1rem" />
      <Flex direction="row" alignItems="center">
        <Text textStyle="h3">All Proposals</Text>
        <Spacer />
        <Button
          variant="new-proposal"
          textStyle="b2-bold"
          data-testid="new-proposal-button"
          onClick={() => navigate("/governance/select-proposal-type")}
        >
          New Proposal
        </Button>
      </Flex>
      <Spacer margin="0.5rem" />
      <VStack>
        {mockProposalData.map((proposal, index) => (
          <ProposalCard proposal={proposal} key={index} />
        ))}
      </VStack>
    </Flex>
  );
};
