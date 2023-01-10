import { Button, Flex, Text } from "@chakra-ui/react";
import { AlertDialog, Color } from "../../../dex-ui-components";
import { UseCancelProposalResult, useDexContext } from "../../hooks";
import { FormattedProposal } from "../Governance/types";

interface CancelProposalModalButtonProps {
  governanceTokenId: string;
  proposal: FormattedProposal | undefined;
  cancelProposal: UseCancelProposalResult;
  isOpenDialogButtonDisabled: boolean;
  isOpenDialogButtonVisible: boolean;
  isAlertDialogOpen: boolean;
  onAlertDialogOpen: () => void;
  onAlertDialogClose: () => void;
  resetServerState: () => void;
}

export function CancelProposalModalButton(props: CancelProposalModalButtonProps) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  /** TODO: Consider refactoring to use react-query to get a balances by ids. */
  const governanceTokenBalance = Number(
    wallet.pairedAccountBalance?.tokens.find((token) => token.tokenId === props.governanceTokenId)?.balance ?? 0
  );

  function closeAlertDialog() {
    props.onAlertDialogClose();
  }

  function handleCancelAlertDialog() {
    closeAlertDialog();
  }

  function handleCancelProposalClicked() {
    props.resetServerState();
    if (props.proposal) {
      const signer = wallet.getSigner();
      props.cancelProposal.mutate({
        contractId: props.proposal?.contractId ?? "",
        title: props.proposal?.title ?? "",
        signer,
      });
    }
    closeAlertDialog();
  }

  if (!props.isOpenDialogButtonVisible) {
    return <></>;
  }

  return (
    <AlertDialog
      openModalComponent={
        <Button variant="secondary" textStyle="h3" width="290px" isDisabled={props.isOpenDialogButtonDisabled}>
          Cancel
        </Button>
      }
      title="Cancel Proposal"
      body={
        <Flex flexDirection="column" gap="1.25rem">
          <Text textStyle="b1" fontSize="1rem">
            {`You’re about to cancel ${props.proposal?.title}. If you do this, DexCoins will be refunded to you and to
            anyone that voted.`}
          </Text>
          <Flex direction="row">
            <Text flex="1" textStyle="b3" color={Color.Grey_02}>
              DexCoins Refunded to You
            </Text>
            <Text flex="1" textStyle="b3" textAlign="right">
              {governanceTokenBalance}
            </Text>
          </Flex>
        </Flex>
      }
      footer={
        <Flex flexDirection="column" width="100%" gap="0.5rem">
          <Button onClick={handleCancelProposalClicked}>Cancel Proposal</Button>
          <Button variant="secondary" onClick={handleCancelAlertDialog}>
            Don't Cancel
          </Button>
        </Flex>
      }
      alertDialogOpen={props.isAlertDialogOpen}
      onAlertDialogOpen={props.onAlertDialogOpen}
      onAlertDialogClose={props.onAlertDialogClose}
    />
  );
}
