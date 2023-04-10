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
import { FormInput } from "../../../../dex-ui-components";
import { CreateADAOData } from "../CreateADAOPage";
import { DAOFormContainer } from "./DAOFormContainer";

interface ReviewNewDAOProps {
  formValues: CreateADAOData;
}

export function ReviewNewDAO(props: ReviewNewDAOProps) {
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
                  value: props.formValues.name,
                  isReadOnly: true,
                }}
              />
              <FormInput<"logoUrl">
                inputProps={{
                  id: "logoUrl",
                  label: "Logo URL",
                  type: "text",
                  value: props.formValues.logoUrl,
                  isReadOnly: true,
                }}
              />
              <Checkbox isChecked={props.formValues.isPublic} isReadOnly>
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
                  value: props.formValues.type,
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
              <FormInput<"token.name">
                inputProps={{
                  id: "token.name",
                  label: "Token name",
                  type: "text",
                  value: props.formValues.token.name,
                  isReadOnly: true,
                }}
              />
              <FormInput<"token.symbol">
                inputProps={{
                  id: "token.symbol",
                  label: "Token symbol",
                  type: "text",
                  value: props.formValues.token.symbol,
                  isReadOnly: true,
                }}
              />
              <FormInput<"token.id">
                inputProps={{
                  id: "token.id",
                  label: "Token id",
                  type: "text",
                  value: props.formValues.token.id,
                  isReadOnly: true,
                }}
              />
              <FormInput<"token.decimals">
                inputProps={{
                  id: "token.decimals",
                  label: "Decimals",
                  type: "number",
                  value: String(props.formValues.token.decimals),
                  isReadOnly: true,
                }}
              />
              <FormInput<"token.initialSupply">
                inputProps={{
                  id: "token.initialSupply",
                  label: "Initial token supply",
                  type: "number",
                  unit: props.formValues.token.symbol,
                  value: String(props.formValues.token.initialSupply),
                  isReadOnly: true,
                }}
              />
              <FormInput<"token.treasuryWalletAccountId">
                inputProps={{
                  id: "token.treasuryWalletAccountId",
                  label: "Treasury wallet account id",
                  type: "text",
                  value: props.formValues.token.treasuryWalletAccountId,
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
                Voting
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Text>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={2} spacingX="1rem" spacingY="0.75rem">
              <FormInput<"voting.quorum">
                inputProps={{
                  id: "voting.quorum",
                  label: "Quorum",
                  type: "number",
                  unit: "%",
                  value: String(props.formValues.voting.quorum),
                  isReadOnly: true,
                }}
              />
              <FormInput<"voting.duration">
                inputProps={{
                  id: "voting.duration",
                  label: "Voting duration",
                  type: "number",
                  unit: "Days",
                  value: String(props.formValues.voting.duration),
                  isReadOnly: true,
                }}
              />
              <FormInput<"voting.lockingPeriod">
                inputProps={{
                  id: "voting.lockingPeriod",
                  label: "Locking period",
                  type: "number",
                  unit: "Days",
                  value: String(props.formValues.voting.lockingPeriod),
                  isReadOnly: true,
                }}
              />
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </DAOFormContainer>
  );
}
