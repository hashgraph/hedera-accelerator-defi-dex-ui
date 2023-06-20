import { useOutletContext } from "react-router-dom";
import { DAOType } from "@services";
import { Flex, useRadioGroup, Text, Box } from "@chakra-ui/react";
import { CreateDAOProposalContext, CreateDAOProposalForm, DAOProposalType } from "../types";
import {
  Color,
  MessageIcon,
  NewTokenIcon,
  MemberIcon,
  RadioCard,
  TextProposalIcon,
  TwoLayerSettingsIcon,
  SettingsToolIcon,
} from "@dex-ui-components";
import { useFormContext } from "react-hook-form";

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
    title: DAOProposalType.UpgradeThreshold,
    label: "Propose to upgrade the member threshold weight.",
    icon: <TwoLayerSettingsIcon boxSize="3.5" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
  {
    title: DAOProposalType.UpgradeVotingDuration,
    label: "Propose to upgrade the voting duration.",
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
    title: DAOProposalType.Message,
    label: "Create a generic message to the DAO members.",
    icon: <MessageIcon boxSize="3.5" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
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

  function getDAOType(type: string) {
    if (type === "multisig") return DAOType.MultiSig;
    if (type === "governance-token") return DAOType.GovernanceToken;
    if (type === "nft") return DAOType.NFT;
    return "";
  }

  return (
    <Flex direction="column" gap="4">
      <Text textStyle="p large regular">What type of proposal would you like to create?</Text>
      <Flex flexDirection="column" gap="4" {...group}>
        {dataArray.map((option, index) => {
          const radio = getRadioProps({ value: option.title });
          return (
            <Box flex="1" key={index}>
              <RadioCard key={option.title} {...radio} padding="0.75rem">
                <Flex gap="3">
                  {option.icon}
                  <Flex flexDirection="column" gap="1">
                    <Text textStyle="p small medium" color="inherit">
                      {option.title}
                    </Text>
                    <Text textStyle="p xsmall regular" color="inherit">
                      {option.label}
                    </Text>
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
