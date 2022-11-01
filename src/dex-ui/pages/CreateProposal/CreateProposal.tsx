import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, Spacer, Text, VStack } from "@chakra-ui/react";
import { Link as ReachLink } from "react-router-dom";
import { AddNewToken } from "./AddNewToken";

// interface CreateProposalProps {}

export const CreateProposal = (props: any) => {
  return (
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
          <Spacer padding="0.5rem" />
          <AddNewToken />
          <Spacer padding="0.5rem" />
          <Flex flexDirection="row" justifyContent="end" gap="10px">
            <Button variant="seconday">Cancel</Button>
            <Button>Preview</Button>
            <Button>Publish</Button>
          </Flex>
        </Box>
      </Flex>
    </VStack>
  );
};
