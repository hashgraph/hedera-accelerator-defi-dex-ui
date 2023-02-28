import { SimpleGrid } from "@chakra-ui/react";
import { FieldErrorsImpl, UseFormRegister } from "react-hook-form";
import { FormInput } from "../../../../dex-ui-components";
import { CreateADAOData } from "../CreateADAOPage";
import { DAOFormContainer } from "./DAOFormContainer";

interface DAOVotingFormProps {
  register: UseFormRegister<CreateADAOData>;
  errors: Partial<FieldErrorsImpl<CreateADAOData>>;
}

export function DAOVotingForm(props: DAOVotingFormProps) {
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
                ...props.register("voting.minProposalDeposit", {
                  required: { value: true, message: "A minimum proposal deposit is required." },
                }),
              },
            }}
            isInvalid={Boolean(props.errors.voting?.minProposalDeposit)}
            errorMessage={props.errors.voting?.minProposalDeposit && props.errors.voting?.minProposalDeposit.message}
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
              ...props.register("voting.quorum", {
                required: { value: true, message: "A quorum required." },
              }),
            },
          }}
          isInvalid={Boolean(props.errors.voting?.quorum)}
          errorMessage={props.errors.voting?.quorum && props.errors.voting?.quorum.message}
        />
        <FormInput<"voting.duration">
          inputProps={{
            id: "voting.duration",
            label: "Voting duration",
            type: "number",
            placeholder: "Enter amount",
            unit: "Days",
            register: {
              ...props.register("voting.duration", {
                required: { value: true, message: "A voting duration is required." },
              }),
            },
          }}
          isInvalid={Boolean(props.errors.voting?.duration)}
          errorMessage={props.errors.voting?.duration && props.errors.voting?.duration.message}
        />
        <FormInput<"voting.lockingPeriod">
          inputProps={{
            id: "voting.lockingPeriod",
            label: "Locking period",
            type: "number",
            placeholder: "Enter amount",
            unit: "Days",
            register: {
              ...props.register("voting.lockingPeriod", {
                required: { value: true, message: "A locking period is required." },
              }),
            },
          }}
          isInvalid={Boolean(props.errors.voting?.lockingPeriod)}
          errorMessage={props.errors.voting?.lockingPeriod && props.errors.voting?.lockingPeriod.message}
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
              ...props.register("voting.strategy", {
                required: { value: true, message: "A voting strategy is required." },
              }),
            },
          }}
          isInvalid={Boolean(props.errors.voting?.strategy)}
          errorMessage={props.errors.voting?.strategy && props.errors.voting?.strategy.message}
        />
      */}
      </SimpleGrid>
    </DAOFormContainer>
  );
}
