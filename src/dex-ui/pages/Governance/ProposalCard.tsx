import { Text, Badge, Box, Flex, HStack, Spacer, VStack, Center, Circle } from "@chakra-ui/react";
import { Card } from "../../../dex-ui-components";
import { Proposal } from "./types";

interface ProposalCardProps {
  proposal: Proposal;
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal } = props;

  const getStatusColor = (status: string) => {
    if (status === "Active") {
      return { bg: "rgba(109, 195, 209, 0.2)", color: "#31A9BD" };
    }
    if (status === "Passed") {
      return { bg: "#E8F6DF", color: "#49A600" };
    }
    if (status === "Failed") {
      return { bg: "#F2F2F4", color: "rgba(0, 0, 0, 0.7)" };
    }

    return { bg: "", color: "" };
  };

  const { bg, color } = getStatusColor(proposal.status);

  return (
    <Card variant="proposal-card" padding="0.75rem 0.25rem">
      <Flex>
        <Center flex="2">
          <VStack>
            <Badge padding="0.25rem 1rem" background={bg} color={color} borderRadius="50px">
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
