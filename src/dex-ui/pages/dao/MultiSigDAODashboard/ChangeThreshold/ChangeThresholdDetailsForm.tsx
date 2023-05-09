import { Flex, Text } from "@chakra-ui/react";
import { Color, FormInput } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "../../CreateADAO/forms/DAOFormContainer";
import { ChangeThresholdForm } from "./types";
import { Member } from "../types";
import { checkForValidPositiveNumber } from "@utils";

interface ChangeThresholdDetailsFormProps {
  members: Member[];
  threshold: number;
}

export function ChangeThresholdDetailsForm(props: ChangeThresholdDetailsFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ChangeThresholdForm>();
  const { members, threshold } = props;
  return (
    <DAOFormContainer>
      <Flex direction="column" gap="5">
        <Flex direction="row" gap="1" alignItems="center">
          <Text textStyle="p medium regular" color={Color.Neutral._500}>
            Current transaction threshold confirmation requirement is
          </Text>
          <Text textStyle="p medium semibold">{`${threshold} / ${members.length} members`}</Text>
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
                    checkForValidPositiveNumber({ input: value, maxCapValue: members.length }) ||
                    "A valid Threshold is required.",
                }),
              },
            }}
            isInvalid={Boolean(errors.newThreshold)}
            errorMessage={errors.newThreshold && errors.newThreshold.message}
          />
          <Text flex="1" textStyle="p medium semibold" paddingTop="0.8rem">
            {`/ ${members.length} members`}
          </Text>
        </Flex>
      </Flex>
    </DAOFormContainer>
  );
}
