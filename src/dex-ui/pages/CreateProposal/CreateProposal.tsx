import { WarningIcon } from "@chakra-ui/icons";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { Link as ReachLink, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Breadcrumb, LoadingDialog } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { TransactionStatus } from "../../store/appSlice";
import { ProposalForm } from "./ProposalForms";
import { Page, PageHeader } from "../../layouts";

export interface CreateProposalLocationProps {
  proposalTitle: string | undefined;
  proposalTransactionId: string | undefined;
  isProposalCreationSuccessful: boolean;
}
interface CreateProposalProps {
  proposalType: string;
}

export const CreateProposal = (props: CreateProposalProps) => {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  const navigate = useNavigate();
  /**
   * Fetching the last form type from the URL and use the string to load the form
   * In case the user bookmarks the URL
   * */
  const { proposalType } = props;
  /**
   * When a new proposal transaction is successful, the user will be redirected to the governance
   * page. Location props are passed to the governance page to populate the transaction
   * success message.
   *
   * TODO: Create a redirect hook.
   */
  useEffect(() => {
    if (governance.proposalTransacationState.status === TransactionStatus.SUCCESS) {
      const { successPayload } = governance.proposalTransacationState;
      const createProposalLocationProps = {
        state: {
          proposalTitle: successPayload.proposal?.title,
          proposalTransactionId: successPayload.transactionResponse?.transactionId.toString(),
          isProposalCreationSuccessful: true,
        } as CreateProposalLocationProps,
      };
      navigate("/governance", createProposalLocationProps);
      governance.clearProposalTransactionState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [governance.proposalTransacationState.status]);

  return (
    <Page
      header={
        <PageHeader
          leftContent={[<Text textStyle="h2">Create New Proposal</Text>]}
          rightContent={[
            <Breadcrumb
              to="/governance/select-proposal-type"
              as={ReachLink}
              label="Back to Select Proposal Type"
              leftIcon={<ArrowLeftIcon />}
            />,
          ]}
        />
      }
      body={
        <>
          <Flex flexDirection="column" alignItems="center" width="100%">
            <Box width="600px">
              <ProposalForm proposalType={proposalType} />
            </Box>
          </Flex>
          <LoadingDialog
            isOpen={governance.proposalTransacationState.status === TransactionStatus.IN_PROGRESS}
            message={"Please confirm the proposal creation transaction in your wallet to proceed."}
          />
          <LoadingDialog
            isOpen={governance.proposalTransacationState.status === TransactionStatus.ERROR}
            message={governance.proposalTransacationState.errorMessage ?? ""}
            icon={<WarningIcon color="#EF5C5C" h={10} w={10} />}
            buttonConfig={{
              text: "Dismiss",
              onClick: () => {
                governance.clearProposalTransactionState();
              },
            }}
          />
        </>
      }
    />
  );
};
