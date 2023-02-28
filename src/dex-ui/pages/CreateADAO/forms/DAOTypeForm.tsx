import { Box, Flex, Text, useRadioGroup } from "@chakra-ui/react";
import { useRef } from "react";
import { UseFormSetValue } from "react-hook-form";
import { RadioCard } from "../../../../dex-ui-components";
import { CreateADAOData } from "../CreateADAOPage";
import { DAOType } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";

const newDAOOptions = [
  {
    name: DAOType.GovernanceToken,
    type: DAOType.GovernanceToken,
    description:
      "Governance rights, voting power and quorum are determined by ownership of fungible governance tokens.",
  },
  /* TODO: For a future version of the form.  
    {
      name: DAOType.MultiSig,
      type: DAOType.MultiSig,
      description: "Governance rights and voting power are concentrated in a centralized group.",
    },
    {
      name: DAOType.NFT,
      type: DAOType.NFT,
      description: "Governance rights and voting power are determined by ownership of an NFT.",
    }, 
  */
];

interface DAOTypeFormProps {
  setValue: UseFormSetValue<CreateADAOData>;
}

export function DAOTypeForm(props: DAOTypeFormProps) {
  const selectedDAOType = useRef<string>(DAOType.GovernanceToken);

  const handleDAOTypeSelectionChange = (event: DAOType) => {
    selectedDAOType.current = event;
    props.setValue("type", event);
  };

  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: DAOType.GovernanceToken,
    onChange: handleDAOTypeSelectionChange,
  });

  const group = getRootProps();

  return (
    <Flex direction="column" alignItems="left" gap="4">
      <Text textStyle="p large regular">What type of DAO would you like to create?</Text>
      <DAOFormContainer rest={group}>
        {newDAOOptions.map((option, index) => {
          const radio = getRadioProps({ value: option.name });
          return (
            <Box flex="1" key={index}>
              <RadioCard key={index} {...radio} padding="0.75rem">
                <Flex flexDirection="column" gap="1">
                  <Text textStyle="p small medium" color="inherit">
                    {option.type}
                  </Text>
                  <Text textStyle="p xsmall regular" color="inherit">
                    {option.description}
                  </Text>
                </Flex>
              </RadioCard>
            </Box>
          );
        })}
      </DAOFormContainer>
    </Flex>
  );
}
