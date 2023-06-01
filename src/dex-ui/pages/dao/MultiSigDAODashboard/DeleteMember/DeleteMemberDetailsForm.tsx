import { Flex, Text } from "@chakra-ui/react";
import { Color, FormInput } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { DeleteMemberForm, DeleteMemberWizardContext } from "./types";
import { checkForValidPositiveNumber } from "@utils";
import { useOutletContext } from "react-router-dom";

export function DeleteMemberDetailsForm() {
  const { membersCount, threshold, memberId } = useOutletContext<DeleteMemberWizardContext>();
  const {
    register,
    formState: { errors },
  } = useFormContext<DeleteMemberForm>();

  return (
    <Flex direction="column" gap="1.3rem">
      <FormInput<"memberAddress">
        inputProps={{
          id: "memberAddress",
          label: "Remove Member",
          isReadOnly: true,
          value: memberId,
          type: "text",
        }}
      />
      <Flex direction="column" gap="1" width="100%">
        <Flex direction="row" gap="1" alignItems="center">
          <Text textStyle="p medium regular" color={Color.Neutral._500}>
            Transaction threshold confirmation requirement is
          </Text>
          <Text textStyle="p medium semibold">{`${threshold} / ${membersCount} members`}</Text>
        </Flex>
        <Text textStyle="p medium regular" color={Color.Neutral._500}>
          By removing a member the threshold changes to:
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
                  checkForValidPositiveNumber({
                    input: value,
                    maxCapValue: membersCount - 1,
                  }) || "A valid Threshold is required.",
              }),
            },
          }}
          isInvalid={Boolean(errors.newThreshold)}
          errorMessage={errors.newThreshold && errors.newThreshold.message}
        />
        <Text flex="1" textStyle="p medium semibold" paddingTop="0.8rem">
          {`/ ${membersCount - 1} members`}
        </Text>
      </Flex>
    </Flex>
  );
}
