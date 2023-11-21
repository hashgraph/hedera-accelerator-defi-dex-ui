import { FormControl, Input, Text, Flex, Box, Spacer, Button } from "@chakra-ui/react";
import { Breadcrumb } from "@shared/ui-kit";
import { Page, PageHeader } from "@dex/layouts";
import { useNavigate } from "react-router-dom";
import { Paths } from "@dex/routes";

/**
 * TODO: Update input fields to match full proposal creation feature set.
 * Use the TokenTransferProposalForm component as a reference for how to use Chakra
 * components and react-form-hooks to create a form.
 */
export function CreateTokenProposalForm() {
  const navigate = useNavigate();

  function handleCancelClick() {
    navigate(Paths.Governance.absolute);
  }

  return (
    <Page
      header={
        <PageHeader
          leftContent={[
            <Text textStyle="h2" key="1">
              Create New Proposal
            </Text>,
          ]}
          rightContent={[
            <Breadcrumb
              key="2"
              to={`${Paths.Governance.absolute}/${Paths.Governance.CreateNewProposal}`}
              label="Back to Select Proposal Type"
            />,
          ]}
        />
      }
      body={
        <>
          <form>
            <Flex flexDirection="column" alignItems="center" width="100%">
              <Box width="600px">
                <Text textStyle="h3">New Token</Text>
                <Spacer padding="0.5rem" />
                <Flex direction="column" gap="0.5rem">
                  <FormControl>
                    <Input variant="form-input" id="title" placeholder="Proposal Title" />
                  </FormControl>
                  <Spacer padding="0.5rem" />
                  <Flex direction="row" justifyContent="right" gap="0.5rem">
                    <Button variant="secondary" padding="10px 27px" height="40px" onClick={handleCancelClick}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" padding="10px 27px" height="40px" alignSelf="end">
                      Publish
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </form>
        </>
      }
    />
  );
}
