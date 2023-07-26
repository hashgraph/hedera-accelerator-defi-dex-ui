import { FormInput } from "@dex-ui-components";
import { CreateANFTDAOForm, DAONFTTokenType } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useFormContext } from "react-hook-form";
import { SimpleGrid } from "@chakra-ui/react";
import { DAOToolTips } from "./constants";

export function NFTDAOVotingForm() {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<CreateANFTDAOForm>();
  const { governance } = getValues();

  return (
    <DAOFormContainer>
      <SimpleGrid columns={2} spacingX="1rem" spacingY="0.75rem">
        <FormInput<"voting.quorum">
          inputProps={{
            id: "voting.quorum",
            label: "Quorum",
            type: "text",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.quorum,
            toolTipLabelPlacement: "top",
            placeholder: "Enter amount",
            unit: "%",
            register: {
              ...register("voting.quorum", {
                required: { value: true, message: "A quorum required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.voting?.quorum)}
          errorMessage={errors.voting?.quorum && errors.voting?.quorum.message}
        />
        <FormInput<"voting.duration">
          inputProps={{
            id: "voting.duration",
            label: "Voting duration",
            type: "number",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.duration,
            toolTipLabelPlacement: "top",
            placeholder: "Enter amount",
            unit: "Blocks",
            register: {
              ...register("voting.duration", {
                required: { value: true, message: "A voting duration is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.voting?.duration)}
          errorMessage={errors.voting?.duration && errors.voting?.duration.message}
        />
        <FormInput<"voting.lockingPeriod">
          inputProps={{
            id: "voting.lockingPeriod",
            label: "Locking period",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.lockingPeriod,
            toolTipLabelPlacement: "top",
            type: "number",
            placeholder: "Enter amount",
            unit: "Blocks",
            register: {
              ...register("voting.lockingPeriod", {
                required: { value: true, message: "A locking period is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.voting?.lockingPeriod)}
          errorMessage={errors.voting?.lockingPeriod && errors.voting?.lockingPeriod.message}
        />
        <FormInput<"voting.minProposalDeposit">
          inputProps={{
            id: "voting.minProposalDeposit",
            value: "1",
            isDisabled: true,
            label: "Minimum proposal deposit",
            type: "text",
            placeholder: "Enter amount",
            unit:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? governance?.newNFT?.symbol ?? ""
                : governance?.existingNFT?.symbol ?? "",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.minimumDeposit,
          }}
        />
      </SimpleGrid>
    </DAOFormContainer>
  );
}
