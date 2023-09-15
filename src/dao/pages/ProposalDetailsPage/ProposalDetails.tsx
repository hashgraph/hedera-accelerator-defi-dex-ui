import { Flex, Divider } from "@chakra-ui/react";
import { ProposalEvent, ProposalType } from "@dao/hooks";
import {
  ProposalActionDetails,
  ProposalDetailsDescription,
  ProposalMemberVotes,
  ProposalTransactionDetails,
} from "./ProposalDetailsComponents";
import { Color, Text, MarkdownRenderer, Tag, TagVariant } from "@shared/ui-kit";

interface ProposalDetailsProps {
  description: string[];
  metadata: string;
  amount: number;
  receiver: string;
  tokenId: string;
  tokenSymbol: string;
  tokenDecimals: number;
  event: ProposalEvent;
  type: ProposalType;
  approvers?: string[];
  approvalCount?: number;
  transactionHash?: string;
  tokenType: string;
}

export function ProposalDetails(props: ProposalDetailsProps) {
  const {
    description,
    metadata,
    amount,
    receiver,
    tokenId,
    tokenSymbol,
    event,
    type,
    approvers,
    approvalCount,
    transactionHash,
    tokenDecimals,
    tokenType,
  } = props;

  return (
    <Flex direction="column" gap="2">
      <Text.P_Medium_Medium color={Color.Grey_Blue._800}>Details</Text.P_Medium_Medium>
      <Flex layerStyle="content-box" direction="column" gap="4">
        <Flex direction="column" gap="2" alignItems="flex-start">
          <Text.P_Small_Medium>Type</Text.P_Small_Medium>
          <Tag variant={TagVariant.Primary} label={type} />
        </Flex>
        {type === ProposalType.TokenTransfer && (
          <>
            <Divider />
            <ProposalActionDetails
              amount={amount}
              targetAccountId={receiver}
              tokenId={tokenId}
              tokenSymbol={tokenSymbol}
              tokenDecimals={tokenDecimals}
              tokenType={tokenType}
              event={event}
            />
          </>
        )}
        <>
          <Divider />
          <ProposalDetailsDescription description={description} />
        </>
        {approvers && approvalCount !== undefined && approvalCount > 0 && (
          <>
            <Divider />
            <ProposalMemberVotes approvers={approvers} approvalCount={approvalCount} />
          </>
        )}
        {transactionHash && (
          <>
            <Divider />
            <ProposalTransactionDetails transactionHash={transactionHash} />
          </>
        )}
        {!!metadata && (
          <>
            <Divider />
            <MarkdownRenderer markdown={metadata} />
          </>
        )}
      </Flex>
    </Flex>
  );
}
