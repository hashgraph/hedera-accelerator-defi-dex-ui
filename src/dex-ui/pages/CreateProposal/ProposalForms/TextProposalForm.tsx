import { Button, Flex, FormControl, FormErrorMessage, Input, Spacer } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<TextProposalFormData>();

  const handleCancelClick = () => navigate("/governance");

  async function onSubmit(data: TextProposalFormData) {
    await governance.createProposal(ProposalType.Text, {
      title: data.title,
      description: data.description,
      linkToDiscussion: "",
    });
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
        <FormControl isInvalid={Boolean(errors.description)}>
          <Controller
            name="description"
            control={control}
            rules={{
              required: { value: true, message: "Description is required." },
              minLength: { value: 107, message: "Please enter atleast 100 characters in the description." },
              validate: (value) => value.length >= 107,
            }}
            render={({ field }) => (
              <TextEditor
                {...field}
                id="description"
                placeholder="Description"
                onError={Boolean(errors.description)}
                onChange={(text) => field.onChange(text)}
                value={field.value || ""}
              />
            )}
          />
          <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
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
