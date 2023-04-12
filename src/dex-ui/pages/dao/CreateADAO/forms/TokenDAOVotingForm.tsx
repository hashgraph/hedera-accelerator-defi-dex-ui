import { SimpleGrid } from "@chakra-ui/react";
import { FormInput } from "../../../../../dex-ui-components";
import { CreateATokenDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useFormContext } from "react-hook-form";

export function TokenDAOVotingForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  return (
    <DAOFormContainer>
      <SimpleGrid columns={2} spacingX="1rem" spacingY="0.75rem">
        {/* TODO: For a future version of the form.
          <FormInput<"voting.minProposalDeposit">
            inputProps={{
              id: "voting.minProposalDeposit",
              label: "Minimum proposal deposit",
              type: "text",
              placeholder: "Enter amount",
              unit: "$TOKEN",
              register: {
                ...register("voting.minProposalDeposit", {
                  required: { value: true, message: "A minimum proposal deposit is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.voting?.minProposalDeposit)}
            errorMessage={errors.voting?.minProposalDeposit && errors.voting?.minProposalDeposit.message}
          />
          */}
        <FormInput<"voting.quorum">
          inputProps={{
            id: "voting.quorum",
            label: "Quorum",
            type: "text",
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
            placeholder: "Enter amount",
            unit: "Days",
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
            placeholder: "Enter amount",
            unit: "Days",
            register: {
              ...register("voting.lockingPeriod", {
                required: { value: true, message: "A locking period is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.voting?.lockingPeriod)}
          errorMessage={errors.voting?.lockingPeriod && errors.voting?.lockingPeriod.message}
        />
        {/* TODO: For a future version of the form.
        <FormInput<"voting.strategy">
          inputProps={{
            id: "voting.strategy",
            label: "Voting strategy",
            type: "text",
            placeholder: "Enter strategy",
            unit: "Days",
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
