import {
  Text,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  SimpleGrid,
  Checkbox,
} from "@chakra-ui/react";
import { ReactElement, cloneElement } from "react";
import { FormInput } from "../../../../../dex-ui-components";
import { DAOFormContainer } from "./DAOFormContainer";
import { DAOType } from "../../../../services";

interface DAOReviewFormProps {
  details: {
    name: string;
    description: string;
    logoUrl: string | undefined;
    isPublic: boolean;
    type: DAOType | undefined;
  };
  governance: ReactElement<typeof FormInput>[];
  voting: ReactElement<typeof FormInput>[];
}

export function DAOReviewForm(props: DAOReviewFormProps) {
  const { details, governance, voting } = props;
  return (
    <DAOFormContainer>
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          <Text textStyle="p medium medium">
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Details
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Text>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={2} spacingX="1rem" spacingY="0.75rem">
              <FormInput<"name">
                inputProps={{
                  id: "name",
                  label: "Name",
                  type: "text",
                  value: details.name,
                  isReadOnly: true,
                }}
              />
              <FormInput<"logoUrl">
                inputProps={{
                  id: "logoUrl",
                  label: "Logo URL",
                  type: "text",
                  value: details.logoUrl,
                  isReadOnly: true,
                }}
              />
              <Checkbox isChecked={details.isPublic} isReadOnly>
                List DAO publicly
              </Checkbox>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <Text textStyle="p medium medium">
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Type
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Text>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={2} spacingX="1rem" spacingY="0.75rem">
              <FormInput<"type">
                inputProps={{
                  id: "type",
                  label: "DAO Type",
                  type: "text",
                  value: details.type,
                  isReadOnly: true,
                }}
              />
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <Text textStyle="p medium medium">
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Governance
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Text>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={2} spacingX="1rem" spacingY="0.75rem">
              {governance.map((formInput, index) => {
                return cloneElement(formInput, { key: index });
              })}
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <Text textStyle="p medium medium">
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Voting
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Text>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={2} spacingX="1rem" spacingY="0.75rem">
              {voting.map((formInput, index) => {
                return cloneElement(formInput, { key: index });
              })}
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </DAOFormContainer>
  );
}
