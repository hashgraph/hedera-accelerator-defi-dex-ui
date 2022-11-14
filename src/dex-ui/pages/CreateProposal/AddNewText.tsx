import { FormControl, Input, VStack } from "@chakra-ui/react";
import { TextEditor } from "../../../dex-ui-components/base/Inputs/TextEditor";
interface NewTextProps {
    value: string;
    handleTitleChange: (event: string) => void;
}

function AddNewText(props: NewTextProps) {
    const { value, handleTitleChange } = props;
    return (
        <VStack alignItems="left" gap="10px">
            <FormControl>
                <Input variant="form-input" placeholder="Proposal Title" />
            </FormControl>
            <FormControl>
                <TextEditor placeholder="Description" value={value} handleTitleChange={handleTitleChange} />
            </FormControl>
            <FormControl>
                <Input variant="form-input" placeholder="Link to Discussion (optional)" />
            </FormControl>
        </VStack>
    );
}

export { AddNewText };