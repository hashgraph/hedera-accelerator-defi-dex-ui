import { Box, Flex, useRadioGroup } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { Text, RadioCard } from "@shared/ui-kit";
import { useOutletContext } from "react-router-dom";
import {
  CreateADAOForm,
  DAOGovernanceTokenType,
  DAONFTTokenType,
  MultiSigDAOGovernanceData,
  MultiSigDAOVotingData,
  NFTDAOGovernanceData,
  NFTDAOVotingData,
  TokenDAOGovernanceData,
  TokenDAOVotingData,
  CreateDAOContext,
} from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useEffect } from "react";
import { DAOType } from "@dao/services";
import { InlineAlert, InlineAlertType } from "@shared/ui-kit";

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
  {
    name: DAOType.NFT,
    type: DAOType.NFT,
    description: "Governance rights and voting power are determined by ownership of an NFT.",
  },
];

function getDefaultFormValues(type: DAOType): {
  governance: TokenDAOGovernanceData | MultiSigDAOGovernanceData | NFTDAOGovernanceData;
  voting: TokenDAOVotingData | MultiSigDAOVotingData | NFTDAOVotingData;
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
  } else if (type === DAOType.GovernanceToken) {
    return {
      governance: {
        newToken: {
          name: "",
          symbol: "",
          decimals: 8,
          logo: "",
          initialSupply: 0,
          tokenWalletAddress: "",
          id: "",
          treasuryWalletAccountId: "",
        },
        existingToken: {
          name: "",
          symbol: "",
          decimals: 0,
          supplyKey: "",
          logo: "",
          initialSupply: 0,
          id: "",
          treasuryWalletAccountId: "",
          mirrorNodeTokenId: undefined,
          tokenType: "",
        },
        tokenType: DAOGovernanceTokenType.NewToken,
      },
      voting: {
        minProposalDeposit: 0,
        quorum: 0,
        duration: 0,
        durationUnit: 1,
        lockingPeriod: 0,
        lockingPeriodUnit: 1,
        strategy: "",
      },
    };
  }
  return {
    governance: {
      newNFT: {
        name: "",
        symbol: "",
        logo: "",
        tokenWalletAddress: "",
        maxSupply: 0,
        id: "",
        treasuryWalletAccountId: "",
      },
      existingNFT: {
        name: "",
        symbol: "",
        logo: "",
        tokenWalletAddress: "",
        maxSupply: 0,
        id: "",
        treasuryWalletAccountId: "",
        tokenType: "",
      },
      tokenType: DAONFTTokenType.NewNFT,
    },
    voting: {
      minProposalDeposit: 0,
      quorum: 0,
      duration: 0,
      durationUnit: 1,
      lockingPeriod: 0,
      lockingPeriodUnit: 1,
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

  const getDAOFeeAndTokenSymbol = (daoType: DAOType) => {
    switch (daoType) {
      case DAOType.MultiSig:
        return { daoFee: multisigDAOFeeConfig?.preciseDAOFee, tokenSymbol: multisigDAOFeeConfig?.symbol };
      case DAOType.GovernanceToken:
        return { daoFee: ftDAOFeeConfig?.preciseDAOFee, tokenSymbol: ftDAOFeeConfig?.symbol };
      case DAOType.NFT:
        return { daoFee: nftDAOFeeConfig?.preciseDAOFee, tokenSymbol: nftDAOFeeConfig?.symbol };
    }
  };
  const { multisigDAOFeeConfig, ftDAOFeeConfig, nftDAOFeeConfig } = useOutletContext<CreateDAOContext>();
  const { daoFee, tokenSymbol } = getDAOFeeAndTokenSymbol(type);
  const defaultFormValues = getDefaultFormValues(type);
  setValue("governance", defaultFormValues.governance);
  setValue("voting", defaultFormValues.voting);

  useEffect(() => {
    if (governance === undefined && voting === undefined) {
      setValue("governance", defaultGovernance);
      setValue("voting", defaultVoting);
    }
  }, [governance, voting, setValue]);

  function handleDAOTypeSelectionChange(event: DAOType) {
    const type = event;
    setValue("type", type);
  }

  const group = getRootProps();

  return (
    <Flex direction="column" alignItems="left" gap="4">
      <Text.P_Large_Regular>What type of DAO would you like to create?</Text.P_Large_Regular>
      <DAOFormContainer rest={group}>
        {newDAOOptions.map((option, index) => {
          const radio = getRadioProps({ value: option.name });
          return (
            <Box flex="1" key={index}>
              <RadioCard key={option.type} {...radio} padding="0.75rem">
                <Flex flexDirection="column" gap="1">
                  <Text.P_Small_Medium color="inherit">{option.type}</Text.P_Small_Medium>
                  <Text.P_XSmall_Regular color="inherit">{option.description}</Text.P_XSmall_Regular>
                </Flex>
              </RadioCard>
            </Box>
          );
        })}
        <InlineAlert
          title={`There's a fee involved in creating a ${type} DAO`}
          message={`Fee amount: ${daoFee ?? ""} ${tokenSymbol ?? ""} If you wish to proceed click next.`}
          type={InlineAlertType.Info}
        />
      </DAOFormContainer>
    </Flex>
  );
}
