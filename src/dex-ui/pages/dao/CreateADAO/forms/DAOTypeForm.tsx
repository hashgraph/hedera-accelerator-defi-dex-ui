import { Box, Flex, Text, useRadioGroup } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { RadioCard } from "@dex-ui-components";
import {
  CreateADAOForm,
  MultiSigDAOGovernanceData,
  MultiSigDAOVotingData,
  TokenDAOGovernanceData,
  TokenDAOVotingData,
} from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useEffect } from "react";
import { DAOType } from "@services";

const newDAOOptions = [
  {
    name: DAOType.GovernanceToken,
    type: DAOType.GovernanceToken,
    description:
      "Governance rights, voting power and quorum are determined by ownership of fungible governance tokens.",
  },
  {
    name: DAOType.MultiSig,
    type: DAOType.MultiSig,
    description: "Governance rights and voting power are concentrated in a centralized group.",
  },
  /* TODO: For a future version of the form.  
    {
      name: DAOType.NFT,
      type: DAOType.NFT,
      description: "Governance rights and voting power are determined by ownership of an NFT.",
    }, 
  */
];

function getDefaultFormValues(type: DAOType): {
  governance: TokenDAOGovernanceData | MultiSigDAOGovernanceData;
  voting: TokenDAOVotingData | MultiSigDAOVotingData;
} {
  if (type === DAOType.MultiSig) {
    return {
      governance: {
        admin: "",
        owners: [],
      },
      voting: {
        threshold: 1,
      },
    };
  }
  return {
    governance: {
      token: {
        name: "",
        symbol: "",
        decimals: 0,
        logo: "",
        initialSupply: 0,
        id: "",
        treasuryWalletAccountId: "",
      },
    },
    voting: {
      minProposalDeposit: 0,
      quorum: 0,
      duration: 0,
      lockingPeriod: 0,
      strategy: "",
    },
  };
}

const { governance: defaultGovernance, voting: defaultVoting } = getDefaultFormValues(DAOType.GovernanceToken);

export function DAOTypeForm() {
  const { getValues, setValue } = useFormContext<CreateADAOForm>();
  const { type, governance, voting } = getValues();
  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: type,
    onChange: handleDAOTypeSelectionChange,
  });

  useEffect(() => {
    if (governance === undefined && voting === undefined) {
      setValue("governance", defaultGovernance);
      setValue("voting", defaultVoting);
    }
  }, [governance, voting, setValue]);

  function handleDAOTypeSelectionChange(event: DAOType) {
    const type = event;
    setValue("type", type);
    const defaultFormValues = getDefaultFormValues(type);
    setValue("governance", defaultFormValues.governance);
    setValue("voting", defaultFormValues.voting);
  }

  const group = getRootProps();

  return (
    <Flex direction="column" alignItems="left" gap="4">
      <Text textStyle="p large regular">What type of DAO would you like to create?</Text>
      <DAOFormContainer rest={group}>
        {newDAOOptions.map((option, index) => {
          const radio = getRadioProps({ value: option.name });
          return (
            <Box flex="1" key={index}>
              <RadioCard key={option.type} {...radio} padding="0.75rem">
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
