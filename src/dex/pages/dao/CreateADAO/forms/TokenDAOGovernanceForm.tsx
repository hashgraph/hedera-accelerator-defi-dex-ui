import { Tabs, TabList, Tab, TabPanels, TabPanel, Spacer } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { CreateATokenDAOForm, DAOGovernanceTokenType } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { Color } from "@shared/ui-kit";
import { useTabFilters } from "@dex/hooks";
import { CreateTokenDAOGovernanceForm } from "./CreateTokenDAOGovernanceForm";
import { ExistingTokenDAOGovernanceForm } from "./ExistingTokenDAOGovernanceForm";

export function TokenDAOGovernanceForm() {
  const { tabIndex, handleTabChange } = useTabFilters(0);
  const { setValue } = useFormContext<CreateATokenDAOForm>();
  setValue(
    "governance.tokenType",
    tabIndex === 0 ? DAOGovernanceTokenType.NewToken : DAOGovernanceTokenType.ExistingToken
  );

  return (
    <>
      <Tabs isFitted onChange={handleTabChange} index={tabIndex} variant="unstyled" width="100%">
        <DAOFormContainer rest={{ padding: "0.1rem" }}>
          <TabList>
            <Tab
              color={Color.Neutral._500}
              _selected={{ color: "white", bg: Color.Grey_Blue._500, borderRadius: "4px" }}
            >
              Create a new token
            </Tab>
            <Tab
              color={Color.Neutral._500}
              _selected={{ color: "white", bg: Color.Grey_Blue._500, borderRadius: "4px" }}
            >
              Use an existing token
            </Tab>
          </TabList>
        </DAOFormContainer>
        <Spacer paddingBottom="2rem" />
        <TabPanels>
          <TabPanel padding="1rem 0">
            <CreateTokenDAOGovernanceForm />
          </TabPanel>
          <TabPanel padding="1rem 0">
            <ExistingTokenDAOGovernanceForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
