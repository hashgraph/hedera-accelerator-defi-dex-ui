import { Flex, Text } from "@chakra-ui/react";
import { Color } from "../../../shared/ui-kit";

interface ConfirmVoteModalBodyProps {
  votingPower: string;
}

const ConfirmVoteModalBody = (props: ConfirmVoteModalBodyProps) => {
  return (
    <Flex direction="column" gap="1.25rem">
      <Flex>
        <Text flex="1" textStyle="b1" fontSize="1rem">
          Your Voting Power
        </Text>
        <Text flex="1" textAlign="right" textStyle="b1">
          {props.votingPower}
        </Text>
      </Flex>
      <Flex direction="column" gap="0.667rem">
        <Text textStyle="h4">Voting Power Breakdown</Text>
        <Flex>
          <Text flex="1" textStyle="b3" color={Color.Grey_02}>
            DexCoins
          </Text>
          <Text flex="1" textStyle="b3" textAlign="right">
            {props.votingPower}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export { ConfirmVoteModalBody };
