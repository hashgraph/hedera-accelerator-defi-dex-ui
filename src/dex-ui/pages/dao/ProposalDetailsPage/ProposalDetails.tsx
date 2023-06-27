import { Text, Flex, Divider } from "@chakra-ui/react";
import { ProposalEvent, ProposalType } from "@hooks";
import {
  ProposalActionDetails,
  ProposalDetailsDescription,
  ProposalMemberVotes,
  ProposalTransactionDetails,
} from "./ProposalDetailsComponents";
import { Color } from "@dex-ui-components";

interface ProposalDetailsProps {
  description: string[];
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
}

export function ProposalDetails(props: ProposalDetailsProps) {
  const {
    description,
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
  } = props;

  return (
    <Flex direction="column" gap="2">
      <Text textStyle="p medium medium" color={Color.Grey_Blue._800}>
        Details
      </Text>
      <Flex layerStyle="content-box" direction="column" gap="4">
        <ProposalActionDetails
          amount={amount}
          targetAccountId={receiver}
          tokenId={tokenId}
          tokenSymbol={tokenSymbol}
          tokenDecimals={tokenDecimals}
          event={event}
          type={type}
        />
        <Divider />
        <ProposalDetailsDescription description={description} />
        <Divider />
        {approvers && approvalCount && transactionHash && (
          <>
            <ProposalMemberVotes approvers={approvers} approvalCount={approvalCount} />
            <Divider />
          </>
        )}
        <ProposalTransactionDetails transactionHash={transactionHash} />
      </Flex>
    </Flex>
  );
}
