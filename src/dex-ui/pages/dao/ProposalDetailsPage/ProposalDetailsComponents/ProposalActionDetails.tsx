import { Text, Flex } from "@chakra-ui/react";
import { Color, HashScanLink, HashscanData } from "@dex-ui-components";
import { ProposalEvent, ProposalType } from "@hooks";
import { formatTokenAmountWithDecimal } from "@utils";

interface ProposalActionDetailsProps {
  amount: number;
  targetAccountId: string;
  tokenId: string;
  tokenSymbol: string;
  tokenDecimals: string;
  event: ProposalEvent;
  type: ProposalType;
}

export function ProposalActionDetails(props: ProposalActionDetailsProps) {
  const { amount, targetAccountId, tokenId, tokenSymbol, tokenDecimals, event, type } = props;
  const amountDisplay = formatTokenAmountWithDecimal(amount, Number(tokenDecimals));

  const LabelDisplays: Readonly<{ [key in ProposalType]: string }> = {
    [ProposalType.TokenTransfer]: "To",
    [ProposalType.AddNewMember]: "New Member",
    [ProposalType.RemoveMember]: "Replace Member",
    [ProposalType.ReplaceMember]: "Remove Member",
  };
  const label = LabelDisplays[type];

  return (
    <Flex direction="row" gap="16">
      {type === ProposalType.TokenTransfer && (
        <Flex direction="column" gap="2">
          <Text textStyle="p small medium">{event}</Text>
          <Flex direction="row" gap="2" alignItems="center">
            <Text textStyle="p medium regular" color={Color.Neutral._700}>
              {amountDisplay} {tokenSymbol}
            </Text>
            <HashScanLink id={tokenId} type={HashscanData.Token} withParentheses />
          </Flex>
        </Flex>
      )}
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">{label}</Text>
        <HashScanLink id={targetAccountId} type={HashscanData.Account} />
      </Flex>
    </Flex>
  );
}
