import { Tabs, TabList, Tab, TabPanels, TabPanel, Spacer } from "@chakra-ui/react";
import { DAOFormContainer } from "./DAOFormContainer";
import { useTabFilters } from "@dex/hooks";
import { CreateTokenNFTDAOForm } from "./CreateTokenNFTDAOForm";
import { ExistingTokenNFTDAOForm } from "./ExistingTokenNFTDAOForm";
import { CreateANFTDAOForm, DAONFTTokenType } from "../types";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

export function NFTDAOGovernanceForm() {
  const { tabIndex, handleTabChange } = useTabFilters(0);
  const { setValue } = useFormContext<CreateANFTDAOForm>();
  useEffect(() => {
    setValue("governance.tokenType", tabIndex === 0 ? DAONFTTokenType.NewNFT : DAONFTTokenType.ExistingNFT);
  }, [setValue, tabIndex]);
  return (
    <>
      <Tabs isFitted onChange={handleTabChange} index={tabIndex} variant="dao-create-new" width="100%">
        <DAOFormContainer rest={{ padding: "0.1rem" }}>
          <TabList>
            <Tab>Create a new token</Tab>
            <Tab>Use an existing token</Tab>
          </TabList>
        </DAOFormContainer>
        <Spacer paddingBottom="2rem" />
        <TabPanels>
          <TabPanel padding="1rem 0">
            <CreateTokenNFTDAOForm />
          </TabPanel>
          <TabPanel padding="1rem 0">
            <ExistingTokenNFTDAOForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
