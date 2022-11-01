import { FormControl, HStack, Input, VStack } from "@chakra-ui/react";

export function AddNewToken(props: any) {
  return (
    <VStack alignItems="left" gap="10px">
      <FormControl>
        <Input placeholder="Proposal Title" />
      </FormControl>
      <FormControl>
        <Input placeholder="Description" />
      </FormControl>
      <FormControl>
        <Input placeholder="Link to Discussion (Optional)" />
      </FormControl>
      <HStack>
        <FormControl>
          <Input placeholder="Token Name" />
        </FormControl>
        <FormControl>
          <Input placeholder="Token Symbol" />
        </FormControl>
      </HStack>
      <FormControl>
        <Input placeholder="Link to Token Icon" />
      </FormControl>
      <FormControl>
        <Input placeholder="Token Backing Organization" />
      </FormControl>
      <FormControl>
        <Input placeholder="Link to Audit Report" />
      </FormControl>
      <FormControl>
        <Input placeholder="Lorem ipsum long form question field" />
      </FormControl>
    </VStack>
  );
}
