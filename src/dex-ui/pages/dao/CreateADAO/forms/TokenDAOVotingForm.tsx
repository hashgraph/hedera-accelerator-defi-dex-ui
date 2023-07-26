import { SimpleGrid } from "@chakra-ui/react";
import { FormInput } from "@dex-ui-components";
import { CreateATokenDAOForm, DAOGovernanceTokenType } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useFormContext } from "react-hook-form";
import { DAOToolTips } from "./constants";
import { ChangeEvent, useState } from "react";

export function TokenDAOVotingForm() {
  const {
    getValues,
    register,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  const { voting, governance } = getValues();
  const [isQuorumWarningVisible, setIsQuorumWarningVisible] = useState(voting?.quorum > 90);

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
            type: "number",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.lockingPeriod,
            toolTipLabelPlacement: "top",
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
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.symbol ?? ""
                : governance?.existingToken?.symbol ?? "",
            isTooltipVisible: true,
            tooltipLabel: DAOToolTips.minimumDeposit,
          }}
        />
        {/* TODO: For a future version of the form.
        <FormInput<"voting.strategy">
          inputProps={{
            id: "voting.strategy",
            label: "Voting strategy",
            type: "text",
            placeholder: "Enter strategy",
            unit: "Blocks",
            register: {
              ...register("voting.strategy", {
                required: { value: true, message: "A voting strategy is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.voting?.strategy)}
          errorMessage={errors.voting?.strategy && errors.voting?.strategy.message}
        />
      */}
      </SimpleGrid>
    </DAOFormContainer>
  );
}
