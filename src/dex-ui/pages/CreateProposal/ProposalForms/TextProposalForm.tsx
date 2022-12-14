import { Button, Flex, FormControl, FormErrorMessage, Input, Spacer } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextEditor } from "../../../../dex-ui-components";
import { useDexContext } from "../../../hooks";
import { ProposalType } from "../../../store/governanceSlice";

type TextProposalFormData = {
  title: string;
  description: string;
};

function TextProposalForm() {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<TextProposalFormData>();

  const handleCancelClick = () => navigate("/governance");

  async function onSubmit(data: TextProposalFormData) {
    // TODO: Proposal Contract functions do not handle both title and description yet.
    // description: data.description,
    await governance.createProposal(ProposalType.Text, { title: data.title });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="0.5rem">
        <FormControl isInvalid={Boolean(errors.title)}>
          <Input
            variant="form-input"
            id="title"
            placeholder="Proposal Title"
            {...register("title", {
              required: { value: true, message: "A title is required." },
            })}
          />
          <FormErrorMessage>{errors.title && errors.title.message}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <TextEditor id="description" placeholder="Description" />
        </FormControl>
        <Spacer padding="0.5rem" />
        <Flex direction="row" justifyContent="right" gap="0.5rem">
          <Button variant="secondary" padding="10px 27px" height="40px" onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" padding="10px 27px" height="40px" isLoading={isSubmitting}>
            Publish
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}

export { TextProposalForm };
