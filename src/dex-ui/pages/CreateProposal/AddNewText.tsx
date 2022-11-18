import { FormControl, Input, VStack } from "@chakra-ui/react";
import { TextEditor } from "../../../dex-ui-components/base/Inputs/TextEditor";
import { ChangeEvent } from "react";
interface NewTextProps {
  textEditorValue: string;
  title: string;
  handleTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTextValueChange: (event: string) => void;
}

function AddNewText(props: NewTextProps) {
  const { textEditorValue, title, handleTitleChange, handleTextValueChange } = props;
  return (
    <VStack alignItems="left" gap="10px">
      <FormControl>
        <Input value={title} variant="form-input" placeholder="Proposal Title" onChange={handleTitleChange} />
      </FormControl>
      <FormControl>
        {/* eslint-disable-next-line max-len */}
        <TextEditor placeholder="Description" textEditorValue={textEditorValue} handleTextValueChange={handleTextValueChange} />
      </FormControl>
      <FormControl>
        <Input variant="form-input" placeholder="Link to Discussion (optional)" />
      </FormControl>
    </VStack>
  );
}

export { AddNewText };
