import { AccountId } from "@hashgraph/sdk";
import { Text, Badge, Box, Button, Flex, Heading, HStack, Spacer, VStack, Center, Circle } from "@chakra-ui/react";
import { Card } from "../../../dex-ui-components";

type VotingStatus = "Review" | "Active" | "Queued to Execute" | "Executed";
type ProposalStatus = "Active" | "Passed" | "Failed";

interface Proposal {
  title: string;
  author: AccountId;
  description: string;
  status: ProposalStatus;
  timeRemaining: string;
  voteCount: {
    yes: number;
    no: number;
    abstain: number;
  };
}

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

interface ProposalCardProps {
  proposal: Proposal;
}

const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;
  return (
    <Card variant="proposal-card" padding="0.75rem 0.25rem">
      <Flex>
        <Center flex="2">
          <VStack>
            <Badge padding="0.25rem 1rem" background="rgba(109, 195, 209, 0.2)" color="#31A9BD" borderRadius="50px">
              {proposal.status}
            </Badge>
            <Text>{proposal.timeRemaining}</Text>
          </VStack>
        </Center>
        <Spacer flex="0.5" />
        <Box flex="12">
          <VStack alignItems="start">
            <Flex width="100%" flexDirection="row">
              <Text flex="4" textStyle="b1-bold">
                {proposal.title}
              </Text>
              <Spacer flex="1" />
              <Text flex="4" textAlign="right" textStyle="b2">{`Author ${proposal.author.toString()}`}</Text>
            </Flex>
            <Text textStyle="b2">{proposal.description}</Text>
          </VStack>
        </Box>
        <Spacer flex="0.5" />
        <Box flex="4" marginRight="1rem">
          <Flex>
            <HStack flex="1">
              <Circle size="1em" bg="#C0DBAB" />
              <Text>{proposal.voteCount.yes}</Text>
            </HStack>
            <HStack flex="1">
              <Circle size="1em" bg="#F6B2AC" />
              <Text>{proposal.voteCount.no}</Text>
            </HStack>
            <HStack flex="1">
              <Circle size="1em" bg="#D1CED1" />
              <Text>{proposal.voteCount.abstain}</Text>
            </HStack>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};

export const Governance = (): JSX.Element => {
  return (
    <Flex flexDirection="column" width="100%" maxWidth="66rem">
      <Heading textStyle="h2">Governance</Heading>
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
          onClick={() => "New Proposal"}
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
