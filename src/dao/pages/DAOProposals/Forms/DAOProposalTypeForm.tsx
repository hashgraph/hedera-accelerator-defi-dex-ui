import { useOutletContext } from "react-router-dom";
import { DAOType } from "@dao/services";
import { Flex, useRadioGroup, Box } from "@chakra-ui/react";
import { CreateDAOProposalContext, CreateDAOProposalForm, DAOProposalType } from "../types";
import {
  Text,
  Color,
  NewTokenIcon,
  MemberIcon,
  RadioCard,
  TextProposalIcon,
  TwoLayerSettingsIcon,
  SettingsToolIcon,
} from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { getDAOType } from "../../utils";

const MultiSigProposals = [
  {
    title: DAOProposalType.Text,
    label: "Create a text only proposal.",
    icon: <TextProposalIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.TokenTransfer,
    label: "Propose a token transfer.",
    icon: <NewTokenIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.TokenAssociate,
    label: "Propose a token associate.",
    icon: <NewTokenIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.UpgradeThreshold,
    label: "Propose to upgrade the member threshold weight.",
    icon: <TwoLayerSettingsIcon boxSize="3.5" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.AddMember,
    label: "Propose to add new member to the team.",
    icon: <MemberIcon boxSize="3.5" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.ReplaceMember,
    label: "Propose to replace an existing team member with a new one.",
    icon: <MemberIcon boxSize="3.5" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.RemoveMember,
    label: "Propose to remove a member from the team.",
    icon: <MemberIcon boxSize="3.5" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.ContractUpgrade,
    label: "Propose to upgrade to the latest version of the DAO's contract.",
    icon: <SettingsToolIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.Generic,
    label: "Create a new generic proposal.",
    icon: <SettingsToolIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
];

const GovernanceProposals = [
  {
    title: DAOProposalType.Text,
    label: "Create a text only proposal.",
    icon: <TextProposalIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.TokenTransfer,
    label: "Propose a token transfer.",
    icon: <NewTokenIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.TokenAssociate,
    label: "Propose a token associate.",
    icon: <NewTokenIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.ContractUpgrade,
    label: "Propose to upgrade to the latest version of the DAO's contract.",
    icon: <SettingsToolIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
];

const NFTProposals = [
  {
    title: DAOProposalType.Text,
    label: "Create a text only proposal.",
    icon: <TextProposalIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.TokenTransfer,
    label: "Propose a token transfer.",
    icon: <NewTokenIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.TokenAssociate,
    label: "Propose a token associate.",
    icon: <NewTokenIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.ContractUpgrade,
    label: "Propose to upgrade to the latest version of the DAO's contract.",
    icon: <SettingsToolIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
];

export function DAOProposalTypeForm() {
  const { daoType } = useOutletContext<CreateDAOProposalContext>();
  const { setValue, getValues } = useFormContext<CreateDAOProposalForm>();
  const { type } = getValues();
  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: type,
    onChange: handleDAOProposalSelectionChange,
  });
  const group = getRootProps();
  const dataArray = getProposalsArray();

  function handleDAOProposalSelectionChange(type: DAOProposalType) {
    setValue("type", type);
  }

  function getProposalsArray() {
    const currentDAO = getDAOType(daoType);
    if (currentDAO === DAOType.MultiSig) return MultiSigProposals;
    if (currentDAO === DAOType.GovernanceToken) return GovernanceProposals;
    if (currentDAO === DAOType.NFT) return NFTProposals;
    return [];
  }

  return (
    <Flex direction="column" gap="4">
      <Text.P_Large_Regular>What type of proposal would you like to create?</Text.P_Large_Regular>
      <Flex flexDirection="column" gap="4" {...group}>
        {dataArray.map((option, index) => {
          const radio = getRadioProps({ value: option.title });
          return (
            <Box flex="1" key={index}>
              <RadioCard key={option.title} {...radio} padding="0.75rem">
                <Flex gap="3">
                  {option.icon}
                  <Flex flexDirection="column" gap="1">
                    <Text.P_Small_Medium color="inherit">{option.title}</Text.P_Small_Medium>
                    <Text.P_XSmall_Regular color="inherit">{option.label}</Text.P_XSmall_Regular>
                  </Flex>
                </Flex>
              </RadioCard>
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
}
