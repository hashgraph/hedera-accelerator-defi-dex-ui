import { FormControl, Input } from "@chakra-ui/react";

/**
 * TODO: Update input fields to match full proposal creation feature set.
 * Use the TokenTransferProposalForm component as a reference for how to use Chakra
 * components and react-form-hooks to create a form.
 */
function TextProposalForm() {
  return (
    <form>
      <FormControl>
        <Input variant="form-input" id="title" placeholder="Proposal Title" />
      </FormControl>
    </form>
  );
}

export { TextProposalForm };
