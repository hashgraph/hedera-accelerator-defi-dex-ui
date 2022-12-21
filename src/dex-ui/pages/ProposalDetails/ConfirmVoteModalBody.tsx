import { Flex, Text } from "@chakra-ui/react";
import { Color } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";

interface ConfirmVoteModalBodyProps {
  governanceTokenId: string;
}

const ConfirmVoteModalBody = (props: ConfirmVoteModalBodyProps) => {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  /** TODO: Consider refactoring to use react-query to get a balances by ids. */
  const governanceTokenBalance = Number(
    wallet.pairedAccountBalance?.tokens.find((token) => token.tokenId === props.governanceTokenId)?.balance ?? 0
  );
  return (
    <Flex direction="column" gap="1.25rem">
      <Flex>
        <Text flex="1" textStyle="b1" fontSize="1rem">
          Your Voting Power
        </Text>
        <Text flex="1" textAlign="right" textStyle="b1">
          {governanceTokenBalance}
        </Text>
      </Flex>
      <Flex direction="column" gap="0.667rem">
        <Text textStyle="h4">Voting Power Breakdown</Text>
        <Flex>
          <Text flex="1" textStyle="b3" color={Color.Grey_02}>
            Dexcoins
          </Text>
          <Text flex="1" textStyle="b3" textAlign="right">
            {governanceTokenBalance}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export { ConfirmVoteModalBody };
