import { Flex, Divider } from "@chakra-ui/react";
import { ProposalEvent, ProposalType, useIPFSContent } from "@dao/hooks";
import {
  ProposalActionDetails,
  ProposalDetailsDescription,
  ProposalMemberVotes,
  ProposalTransactionDetails,
} from "./ProposalDetailsComponents";
import { Color, Text, MarkdownRenderer, Tag, TagVariant, IPFSLink, InlineAlert, InlineAlertType } from "@shared/ui-kit";
import { LoadingSpinnerLayout } from "@dex/layouts";
import { isCIDValid } from "@dao/utils";

const { VITE_PUBLIC_PINATA_GATEWAY_URL } = import.meta.env;

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
    metadata: CID,
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
  const ipfsContentQueryResults = useIPFSContent(CID);
  const { data: IPFSData, isSuccess, isLoading, isError, error } = ipfsContentQueryResults;

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
        {isCIDValid(CID) && (
          <>
            <Divider />
            <Flex direction="column" gap="2">
              <Text.P_Small_Medium>IPFS CID</Text.P_Small_Medium>
              <IPFSLink gatewayURL={VITE_PUBLIC_PINATA_GATEWAY_URL} CID={CID} />
            </Flex>
          </>
        )}
        {isCIDValid(CID) && isLoading ? (
          <>
            <Divider />
            <LoadingSpinnerLayout />
          </>
        ) : (
          <>
            <Divider />
            {!!IPFSData && isSuccess ? (
              <MarkdownRenderer markdown={IPFSData} />
            ) : isError ? (
              <InlineAlert
                message={`Failed to fetch content from IPFS. ${error.response?.data.error ?? error.message}`}
                type={InlineAlertType.Error}
              />
            ) : (
              <></>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
}
