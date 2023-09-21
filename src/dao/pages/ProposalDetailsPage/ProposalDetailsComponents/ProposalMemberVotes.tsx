import { Flex } from "@chakra-ui/react";
import { Text, HashScanLink, HashscanData } from "@shared/ui-kit";

interface ProposalMemberVotesProps {
  approvers: string[];
  approvalCount: number;
}

export function ProposalMemberVotes(props: ProposalMemberVotesProps) {
  const { approvers, approvalCount } = props;

  const ApproversList =
    approvalCount === 0 ? (
      <Text.P_Small_Regular_Italic>
        This transaction has not yet been confirmed by an owner.
      </Text.P_Small_Regular_Italic>
    ) : (
      <>
        {approvers.map((approver) => (
          <HashScanLink id={approver} key={approver} type={HashscanData.Account} />
        ))}
      </>
    );

  return (
    <Flex direction="column" gap="2" width="100%">
      <Text.P_Small_Medium>Votes from</Text.P_Small_Medium>
      {ApproversList}
    </Flex>
  );
}
