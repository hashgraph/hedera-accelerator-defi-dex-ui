import { Flex } from "@chakra-ui/react";
import { Text, Color, FormInput, FormTextArea } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { CreateDAOUpgradeThresholdForm, CreateDAOProposalContext, DAOProposalType } from "../types";
import { checkForValidPositiveNumber } from "@dex/utils";
import { useOutletContext } from "react-router-dom";

export function DAOUpgradeThresholdDetailsForm() {
  const { membersCount, threshold, proposalType } = useOutletContext<CreateDAOProposalContext>();
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext<CreateDAOUpgradeThresholdForm>();

  if (proposalType !== DAOProposalType.UpgradeThreshold) {
    setValue("type", DAOProposalType.UpgradeThreshold);
  }

  return (
    <Flex direction="column" gap="1.1rem">
      <FormInput<"title">
        inputProps={{
          id: "title",
          label: "Title",
          type: "text",
          placeholder: "Enter Title",
          register: {
            ...register("title", {
              required: { value: true, message: "A title is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.title)}
        errorMessage={errors?.title && errors?.title?.message}
      />
      <FormTextArea<"description">
        textAreaProps={{
          id: "description",
          label: "Description",
          placeholder: "Add a description",
          register: {
            ...register("description", {
              required: { value: true, message: "A description is required." },
              validate: (value) => value.length <= 240 || "Maximum character count for the description is 240.",
            }),
          },
        }}
        isInvalid={Boolean(errors?.description)}
        errorMessage={errors?.description && errors?.description?.message}
      />
      <Flex direction="row" gap="1" alignItems="center">
        <Text.P_Medium_Regular color={Color.Neutral._500}>
          Current proposal threshold confirmation requirement is
        </Text.P_Medium_Regular>
        <Text.P_Medium_Semibold>{`${threshold} / ${membersCount} members`}</Text.P_Medium_Semibold>
      </Flex>
      <Flex direction="row" gap="2" alignItems="center">
        <FormInput<"newThreshold">
          flex="4"
          inputProps={{
            id: "newThreshold",
            flex: 4,
            label: "Threshold",
            isTooltipVisible: true,
            tooltipLabel: "",
            type: "number",
            unit: "members",
            placeholder: "Enter Threshold",
            register: {
              ...register("newThreshold", {
                validate: (value) =>
                  checkForValidPositiveNumber({ input: value, maxCapValue: membersCount }) ||
                  "A valid Threshold is required.",
              }),
            },
          }}
          isInvalid={Boolean(errors?.newThreshold)}
          errorMessage={errors?.newThreshold && errors?.newThreshold?.message}
        />
        <Text.P_Medium_Semibold flex="1" paddingTop="0.8rem">
          {`/ ${membersCount} members`}
        </Text.P_Medium_Semibold>
      </Flex>
    </Flex>
  );
}
