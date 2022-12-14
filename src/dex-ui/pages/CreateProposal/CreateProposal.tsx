import { WarningIcon } from "@chakra-ui/icons";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex, Spacer, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { Link as ReachLink, useNavigate } from "react-router-dom";
import { LoadingDialog } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { TransactionStatus } from "../../store/appSlice";
import { ProposalForm } from "./ProposalForms";

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
    <>
      <Flex flexDirection="column" alignItems="left" width="100%" gap="0.5rem">
        {/* TODO: turn into component */}
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={ReachLink} to="/governance/select-proposal-type">
              <Text textStyle="link">{"< Select Proposal Type"}</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Text textStyle="h2">Create New Proposal</Text>
        <Spacer padding="1.5rem" />
        <Box alignSelf="center" width="600px">
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
  );
};
