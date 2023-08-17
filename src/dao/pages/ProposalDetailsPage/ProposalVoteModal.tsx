import { Button, Flex, Text } from "@chakra-ui/react";
import { VoteType } from "@dex/pages";

interface ConfirmVoteModalBodyProps {
  tokenSymbol: string;
  votingPower: string;
  handleVoteButtonClicked: (VoteType: VoteType) => void;
}

const ProposalVoteModal = (props: ConfirmVoteModalBodyProps) => {
  const { tokenSymbol, votingPower, handleVoteButtonClicked } = props;
  function handleVoteYesClicked() {
    handleVoteButtonClicked(VoteType.For);
  }

  function handleVoteNoClicked() {
    handleVoteButtonClicked(VoteType.Against);
  }

  function handleVoteAbstainClicked() {
    handleVoteButtonClicked(VoteType.Abstain);
  }
  return (
    <Flex direction="column" gap="1.25rem">
      <Flex>
        <Text flex="1" textStyle="b1" fontSize="1rem">
          Your Voting Power
        </Text>
        <Text flex="1" textAlign="right" textStyle="b1">
          {votingPower} {tokenSymbol}
        </Text>
      </Flex>
      <Flex gap="4">
        <Button flex="1" onClick={handleVoteYesClicked}>
          Yes
        </Button>
        <Button flex="1" onClick={handleVoteNoClicked}>
          No
        </Button>
        <Button flex="1" onClick={handleVoteAbstainClicked}>
          Abstain
        </Button>
      </Flex>
    </Flex>
  );
};

export { ProposalVoteModal };
