import { Text, Flex, Button } from "@chakra-ui/react";
import { AlertDialog, Color } from "@shared/ui-kit";

interface ProposalCancelModalProps {
  title: string;
  tokenSymbol: string;
  votingPower: string;
  handleCancelProposalClicked: () => void;
  dialogState: {
    isVoteOpen: boolean;
    isCancelProposalOpen: boolean;
  };
  setDialogState: (dialogState: { isVoteOpen: boolean; isCancelProposalOpen: boolean }) => void;
}

export function ProposalCancelModal(props: ProposalCancelModalProps) {
  const { title, tokenSymbol, votingPower, handleCancelProposalClicked, dialogState, setDialogState } = props;

  return (
    <AlertDialog
      openModalComponent={
        <Button variant="secondary" textStyle="h3">
          Cancel
        </Button>
      }
      title="Cancel Proposal"
      body={
        <Flex flexDirection="column" gap="1.25rem">
          <Text textStyle="b1" fontSize="1rem">
            {`You’re about to cancel ${title}.
                 If you do this, ${tokenSymbol} tokens will be refunded to you and to
            anyone that voted.`}
          </Text>
          <Flex direction="row">
            <Text flex="1" textStyle="b3" color={Color.Grey_02}>
              {`${tokenSymbol} Tokens Refunded to You`}
            </Text>
            <Text flex="1" textStyle="b3" textAlign="right">
              {votingPower}
            </Text>
          </Flex>
        </Flex>
      }
      footer={
        <Flex flexDirection="column" width="100%" gap="0.5rem">
          <Button onClick={handleCancelProposalClicked}>Cancel Proposal</Button>
          <Button variant="secondary" onClick={() => setDialogState({ ...dialogState, isCancelProposalOpen: false })}>
            Don&apos;t Cancel
          </Button>
        </Flex>
      }
      alertDialogOpen={dialogState.isCancelProposalOpen}
      onAlertDialogOpen={() => setDialogState({ ...dialogState, isCancelProposalOpen: true })}
      onAlertDialogClose={() => setDialogState({ ...dialogState, isCancelProposalOpen: false })}
    />
  );
}
