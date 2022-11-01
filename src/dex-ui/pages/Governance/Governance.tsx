import { useNavigate } from "react-router-dom";
import { Text, Button, Flex, Spacer, VStack } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { useDexContext } from "../../hooks";
import { useGovernanceData } from "../../hooks/useGovernanceData";

export const Governance = (): JSX.Element => {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  useGovernanceData();
  const navigate = useNavigate();

  return (
    <Flex flexDirection="column" width="100%">
      <Text textStyle="h2">Governance</Text>
      <Spacer margin="1rem" />
      <Text textStyle="h3">Active Proposals</Text>
      <Spacer margin="0.5rem" />
      <VStack>
        {governance.proposals
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
        {governance.proposals.map((proposal, index) => (
          <ProposalCard proposal={proposal} key={index} />
        ))}
      </VStack>
    </Flex>
  );
};
