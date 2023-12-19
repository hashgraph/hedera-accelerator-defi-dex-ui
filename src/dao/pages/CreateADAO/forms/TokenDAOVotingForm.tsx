import { SimpleGrid } from "@chakra-ui/react";
import { FormInput, TimeUnitSelector } from "@shared/ui-kit";
import { CreateATokenDAOForm, DAOGovernanceTokenType } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useFormContext } from "react-hook-form";
import { DAOToolTips } from "@dao/pages";
import { ChangeEvent, useState } from "react";
import { useTimeInputPattern } from "@dao/hooks";

export function TokenDAOVotingForm() {
  const {
    getValues,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  const { voting, governance } = getValues();
  const [isQuorumWarningVisible, setIsQuorumWarningVisible] = useState(voting?.quorum > 90);
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
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.quorum,
            toolTipLabelPlacement: "top",
            type: "text",
            placeholder: "Enter amount",
            unit: "%",
            register: {
              ...register("voting.quorum", {
                required: { value: true, message: "A quorum required." },
                min: { value: 0, message: "Quorum must be between 0% and 100%." },
                max: { value: 100, message: "Quorum must be between 0% and 100%." },
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                  const inputElement = event.target as HTMLInputElement;
                  setIsQuorumWarningVisible(Number(inputElement.value) > 90);
                },
              }),
            },
          }}
          isInvalid={Boolean(errors.voting?.quorum)}
          errorMessage={errors.voting?.quorum && errors.voting?.quorum.message}
          warningHeader={isQuorumWarningVisible ? "High Quorum" : ""}
          warningMessage={
            isQuorumWarningVisible
              ? `A high quorum can make it difficult to get enough members 
              to vote on a proposal. This can lead to delays and inaction.`
              : ""
          }
        />
        <FormInput<"voting.duration">
          inputProps={{
            id: "voting.duration",
            label: "Voting duration",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.duration,
            toolTipLabelPlacement: "top",
            type: "number",
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
            type: "number",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.lockingPeriod,
            toolTipLabelPlacement: "top",
            placeholder: "Enter duration",
            pointerEvents: "all",
            unit: <TimeUnitSelector selectControls={register("voting.lockingPeriodUnit", {})} />,
            register: {
              ...register("voting.lockingPeriod", {
                required: {
                  value: true,

                  message: "A vote delay period is required. set to zero if unsure.",
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
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.symbol ?? ""
                : governance?.existingToken?.symbol ?? "",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.minimumDeposit,
          }}
        />
      </SimpleGrid>
    </DAOFormContainer>
  );
}
