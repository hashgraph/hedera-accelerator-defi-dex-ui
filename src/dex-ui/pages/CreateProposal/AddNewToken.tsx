import { FormControl, HStack, Input, VStack } from "@chakra-ui/react";

export function AddNewToken(props: any) {
  return (
    <VStack alignItems="left" gap="10px">
      <FormControl>
        <Input variant="form-input" placeholder="Proposal Title" />
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
