import { Text, Flex } from "@chakra-ui/react";
import { Color, HashScanLink, HashscanData, HederaIcon, SendTokenIcon } from "@dex-ui-components";
import { formatTokenAmountWithDecimal } from "@dex-ui/utils";
import { ProposalEvent, ProposalType } from "@hooks";

interface ProposalActionDetailsProps {
  amount: number;
  targetAccountId: string;
  tokenId: string;
  tokenSymbol: string;
  tokenDecimals: number;
  event: ProposalEvent;
  type: ProposalType;
}

export function ProposalActionDetails(props: ProposalActionDetailsProps) {
  const { amount, targetAccountId, tokenId, tokenSymbol, event, type, tokenDecimals } = props;

  const LabelDisplays: Readonly<{ [key in ProposalType]: string }> = {
    [ProposalType.TokenTransfer]: "To",
    [ProposalType.AddNewMember]: "Add Member",
    [ProposalType.RemoveMember]: "Replace Member",
    [ProposalType.ReplaceMember]: "Remove Member",
    [ProposalType.ChangeThreshold]: "Upgrade Threshold",
  };
  const label = LabelDisplays[type];

  return (
    <Flex direction="row" gap="16">
      {type === ProposalType.TokenTransfer && (
        <Flex direction="column" gap="2">
          <Text textStyle="p small medium">{event}</Text>
          <Flex direction="row" gap="1" alignItems="center">
            <HederaIcon />
            <SendTokenIcon boxSize={5} stroke={Color.Destructive._400} marginRight={1} marginLeft={2} />
            <Text textStyle="p medium regular" color={Color.Neutral._700}>
              {formatTokenAmountWithDecimal(amount, tokenDecimals)} {tokenSymbol}
            </Text>
            <HashScanLink id={tokenId} type={HashscanData.Token} withParentheses />
          </Flex>
        </Flex>
      )}
      <Flex direction="column" gap="4">
        <Text textStyle="p small medium">{label}</Text>
        <HashScanLink id={targetAccountId} type={HashscanData.Account} />
      </Flex>
    </Flex>
  );
}
