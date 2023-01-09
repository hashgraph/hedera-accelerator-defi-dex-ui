import { Flex, Text } from "@chakra-ui/react";
import { useDexContext } from "../../hooks";

interface ChangeVoteModalBodyProps {
  governanceTokenId: string;
}

export function ChangeVoteModalBody(props: ChangeVoteModalBodyProps) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  /** TODO: Consider refactoring to use react-query to get a balances by ids. */
  const governanceTokenBalance = Number(
    wallet.pairedAccountBalance?.tokens.find((token) => token.tokenId === props.governanceTokenId)?.balance ?? 0
  );

  return (
    <Flex direction="column" gap="0.25rem">
      <Flex>
        <Text flex="1" textStyle="b1" fontSize="1rem">
          Current Vote
        </Text>
        <Text flex="1" textAlign="right" textStyle="b1">
          N/A
        </Text>
      </Flex>
      <Flex>
        <Text flex="1" textStyle="b1" fontSize="1rem">
          Current Voting Power
        </Text>
        <Text flex="1" textAlign="right" textStyle="b1">
          {governanceTokenBalance}
        </Text>
      </Flex>
    </Flex>
  );
}
