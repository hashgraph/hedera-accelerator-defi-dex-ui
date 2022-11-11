import { FormControl, HStack, Input, VStack } from "@chakra-ui/react";
import { ChangeEvent } from "react";

interface NewTokenProps {
  title: string;
  handleTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function AddNewToken(props: NewTokenProps) {
  const { title, handleTitleChange } = props;
  return (
    <VStack alignItems="left" gap="10px">
      <FormControl>
        <Input value={title} onChange={handleTitleChange} variant="form-input" placeholder="Proposal Title" />
      </FormControl>
      <FormControl>
        <Input variant="form-input" placeholder="Description" />
      </FormControl>
      <FormControl>
        <Input variant="form-input" placeholder="Link to Discussion (Optional)" />
      </FormControl>
      <HStack>
        <FormControl>
          <Input variant="form-input" placeholder="Token Name" />
        </FormControl>
        <FormControl>
          <Input variant="form-input" placeholder="Token Symbol" />
        </FormControl>
      </HStack>
      <FormControl>
        <Input variant="form-input" placeholder="Link to Token Icon" />
      </FormControl>
      <FormControl>
        <Input variant="form-input" placeholder="Token Backing Organization" />
      </FormControl>
      <FormControl>
        <Input variant="form-input" placeholder="Link to Audit Report" />
      </FormControl>
      <FormControl>
        <Input variant="form-input" placeholder="Lorem ipsum long form question field" />
      </FormControl>
    </VStack>
  );
}
