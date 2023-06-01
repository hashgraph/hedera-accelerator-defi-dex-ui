import { Flex, Text } from "@chakra-ui/react";
import { Color, FormInput } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { AddMemberForm, AddMemberWizardContext } from "./types";
import { useOutletContext } from "react-router-dom";
import { checkForValidAccountId, checkForValidPositiveNumber } from "@utils";

export function AddMemberDetailsForm() {
  const { threshold, membersCount } = useOutletContext<AddMemberWizardContext>();
  const {
    register,
    formState: { errors },
  } = useFormContext<AddMemberForm>();
  return (
    <Flex direction="column" gap="1.3rem">
      <FormInput<"memberAddress">
        inputProps={{
          id: "memberAddress",
          label: "Member Address",
          type: "text",
          placeholder: "Enter Member Address",
          register: {
            ...register("memberAddress", {
              required: { value: true, message: "A member address is required." },
              validate: (value) => checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
            }),
          },
        }}
        isInvalid={Boolean(errors.memberAddress)}
        errorMessage={errors.memberAddress && errors.memberAddress.message}
      />
      <Flex direction="column" gap="1">
        <Flex direction="row" gap="1" alignItems="center">
          <Text textStyle="p medium regular" color={Color.Neutral._500}>
            Transaction threshold confirmation requirement is
          </Text>
          <Text textStyle="p medium semibold">{`${threshold} / ${membersCount} members`}</Text>
        </Flex>
        <Text textStyle="p medium regular" color={Color.Neutral._500}>
          By adding the new member the threshold changes to:
        </Text>
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
                  checkForValidPositiveNumber({ input: value, maxCapValue: membersCount + 1 }) ||
                  "A valid Threshold is required.",
              }),
            },
          }}
          isInvalid={Boolean(errors.newThreshold)}
          errorMessage={errors.newThreshold && errors.newThreshold.message}
        />
        <Text flex="1" textStyle="p medium semibold" paddingTop="0.8rem">{`/ ${membersCount + 1} members`}</Text>
      </Flex>
    </Flex>
  );
}
