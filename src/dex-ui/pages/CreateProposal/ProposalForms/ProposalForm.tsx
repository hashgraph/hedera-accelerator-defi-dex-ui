import { ReactElement } from "react";
import { Spacer, Text } from "@chakra-ui/react";
import { TokenTransferProposalForm, CreateTokenProposalForm, TextProposalForm, ContractUpgradeProposalForm } from ".";
import * as ProposalType from "../constants";

interface ProposalFormData {
  title: string;
  form: ReactElement;
}

const getProposalFormData = (proposalType: string): ProposalFormData => {
  switch (proposalType) {
    case ProposalType.NEW_TOKEN:
      return {
        title: "New Token",
        form: <CreateTokenProposalForm />,
      };
    case ProposalType.TEXT:
      return {
        title: "Text Proposal",
        form: <TextProposalForm />,
      };
    case ProposalType.TOKEN_TRANSFER:
      return {
        title: "Token Transfer",
        form: <TokenTransferProposalForm />,
      };
    case ProposalType.CONTRACT_UPGRADE:
      return {
        title: "Contract Upgrade",
        form: <ContractUpgradeProposalForm />,
      };
    default:
      return {
        title: "",
        form: <></>,
      };
  }
};

interface ProposalFormProps {
  proposalType: string;
}

const ProposalForm = (props: ProposalFormProps): ReactElement => {
  const { proposalType } = props;
  const { title, form } = getProposalFormData(proposalType);
  return (
    <>
      <Text textStyle="h3">{title}</Text>
      <Spacer padding="0.5rem" />
      {form}
    </>
  );
};

export { ProposalForm };
