import { FormInput, TimeUnitSelector } from "@shared/ui-kit";
import { CreateANFTDAOForm, DAONFTTokenType } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useFormContext } from "react-hook-form";
import { SimpleGrid } from "@chakra-ui/react";
import { DAOToolTips } from "@dao/pages";
import { useTimeInputPattern } from "@dao/hooks";

export function NFTDAOVotingForm() {
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<CreateANFTDAOForm>();
  const { voting, governance } = getValues();
  const { handleTimeInputChangeWithPattern: handleDurationChangeWithPattern } = useTimeInputPattern((value: number) =>
    setValue("voting.duration", value)
  );
  const { handleTimeInputChangeWithPattern: handleLockingPeriodChangeWithPattern } = useTimeInputPattern(
    (value: number) => setValue("voting.lockingPeriod", value)
  );

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
            placeholder: "Enter duration",
            pointerEvents: "all",
            unit: <TimeUnitSelector selectControls={register("voting.durationUnit", {})} />,
            register: {
              ...register("voting.duration", {
                required: { value: true, message: "A voting duration is required." },
                onChange: handleDurationChangeWithPattern,
              }),
            },
          }}
          isInvalid={Boolean(errors.voting?.duration)}
          errorMessage={errors.voting?.duration && errors.voting?.duration.message}
        />
        <FormInput<"voting.lockingPeriod">
          inputProps={{
            id: "voting.lockingPeriod",
            label: "Delay Period",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.lockingPeriod,
            toolTipLabelPlacement: "top",
            type: "number",
            placeholder: "Enter duration",
            pointerEvents: "all",
            unit: <TimeUnitSelector selectControls={register("voting.lockingPeriodUnit", {})} />,
            register: {
              ...register("voting.lockingPeriod", {
                required: {
                  value: true,
                  message: "A proposal delay period is required. set to zero if unsure.",
                },
                validate: () => {
                  return voting.lockingPeriod < voting.duration;
                },
                onChange: handleLockingPeriodChangeWithPattern,
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
