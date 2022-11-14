import { WarningIcon } from "@chakra-ui/icons";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, Spacer, Text, VStack } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { Link as ReachLink, useNavigate } from "react-router-dom";
import { LoadingDialog } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { TransactionStatus } from "../../store/appSlice";
import { AddNewText } from "./AddNewText";
import { AddNewToken } from "./AddNewToken";

export interface CreateProposalLocationProps {
  proposalTitle: string | undefined;
  proposalTransactionId: string | undefined;
  isProposalCreationSuccessful: boolean;
}

export const CreateProposal = (props: any) => {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  const navigate = useNavigate();

  /**
   * Temporarily managing form values with standard React state.
   * This should be replaced with Formik in the future.
   * */
  const [title, setTitle] = useState("");
  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  /**
   * Temporarily saving the values for new AddNewTextComponent.
   * This should be replaced with Formik in the future.
   * */
  const [value, setValue] = useState("");
  const handleValueChange = (event: string) => {
    setValue(event);
  };

  /**
   * When a new proposal transaction is successful, the user will be redirected to the governance
   * page. Location props are passed to the governance page to populate the transaction
   * success message.
   */
  useEffect(() => {
    if (governance.proposalTransacationState.status === TransactionStatus.SUCCESS) {
      const { successPayload } = governance.proposalTransacationState;
      const createProposalLocationProps = {
        state: {
          proposalTitle: successPayload?.proposal.title,
          proposalTransactionId: successPayload?.transactionResponse.transactionId.toString(),
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
      <VStack alignItems="left" width="100%">
        <Breadcrumb flex="1">
          <BreadcrumbItem>
            <BreadcrumbLink as={ReachLink} to="/governance/select-proposal-type">
              <Text textStyle="link">{"< Select Proposal Type"}</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Text flex="1" textStyle="h2" paddingBottom="3rem">
          Create New Proposal
        </Text>
        <Flex flexDirection="column" alignItems="center">
          <Box width="600px">
            <Text textStyle="h3">Add New Token</Text>
            <Spacer padding="1rem" />
            {/* <AddNewToken title={title} handleTitleChange={handleTitleChange} /> */}
            <AddNewText value={value} handleTitleChange={handleValueChange} />
            <Spacer padding="1.5rem" />
            <Flex flexDirection="row" justifyContent="end" gap="10px">
              <Button variant="secondary" padding="10px 27px" height="40px">
                Preview
              </Button>
              <Button
                variant="primary"
                padding="10px 27px"
                height="40px"
                onClick={() => {
                  governance.sendCreateNewTokenProposalTransaction({ title });
                }}
              >
                Publish
              </Button>
            </Flex>
          </Box>
        </Flex>
      </VStack>
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
