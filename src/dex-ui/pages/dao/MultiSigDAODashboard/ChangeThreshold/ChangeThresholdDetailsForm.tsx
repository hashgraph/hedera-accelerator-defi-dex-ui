import { Flex, Text } from "@chakra-ui/react";
import { Color, FormInput } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { ChangeThresholdForm, ChangeThresholdWizardContext } from "./types";
import { checkForValidPositiveNumber } from "@utils";
import { useOutletContext } from "react-router-dom";

export function ChangeThresholdDetailsForm() {
  const { membersCount, threshold } = useOutletContext<ChangeThresholdWizardContext>();
  const {
    register,
    formState: { errors },
  } = useFormContext<ChangeThresholdForm>();

  return (
    <Flex direction="column" gap="1.3rem">
      <Flex direction="row" gap="1" alignItems="center">
        <Text textStyle="p medium regular" color={Color.Neutral._500}>
          Current proposal threshold confirmation requirement is
        </Text>
        <Text textStyle="p medium semibold">{`${threshold} / ${membersCount} members`}</Text>
      </Flex>
      <Flex direction="row" gap="2" alignItems="center">
        <FormInput<"newThreshold">
          flex="4"
          inputProps={{
            id: "newThreshold",
            flex: 4,
            label: "Threshold",
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
          isInvalid={Boolean(errors.newThreshold)}
          errorMessage={errors.newThreshold && errors.newThreshold.message}
        />
        <Text flex="1" textStyle="p medium semibold" paddingTop="0.8rem">
          {`/ ${membersCount} members`}
        </Text>
      </Flex>
    </Flex>
  );
}
