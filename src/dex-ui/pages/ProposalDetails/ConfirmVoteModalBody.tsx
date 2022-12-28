import { Flex, Text } from "@chakra-ui/react";
import { Color } from "../../../dex-ui-components";

const ConfirmVoteModalBody = () => {
  return (
    <Flex direction="column" gap="1.25rem">
      <Flex>
        <Text flex="1" textStyle="b1" fontSize="1rem">
          Your Voting Power
        </Text>
        <Text flex="1" textAlign="right" textStyle="b1">
          -
        </Text>
      </Flex>
      <Flex direction="column" gap="0.667rem">
        <Text textStyle="h4">Voting Power Breakdown</Text>
        <Flex>
          <Text flex="1" textStyle="b3" color={Color.Grey_02}>
            Dexcoins
          </Text>
          <Text flex="1" textStyle="b3" textAlign="right">
            -
          </Text>
        </Flex>
        <Flex>
          <Text flex="1" textStyle="b3" color={Color.Grey_02}>
            LP Tokens
          </Text>
          <Text flex="1" textStyle="b3" textAlign="right">
            -
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export { ConfirmVoteModalBody };
