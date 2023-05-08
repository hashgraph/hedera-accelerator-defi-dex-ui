import { Flex, Text } from "@chakra-ui/react";
import { Color, FormInput } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "../CreateADAO/forms/DAOFormContainer";
import { DeleteMemberForm } from "./types";
import { Member } from "../DAODetailsPage/MultiSigDAODashboard";
import { checkForValidPositiveNumber } from "@pages";

interface DeleteMemberDetailsFormProps {
  members: Member[];
  memberId: string;
  threshold: number;
}

export function DeleteMemberDetailsForm(props: DeleteMemberDetailsFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<DeleteMemberForm>();
  const { members, threshold, memberId } = props;
  return (
    <DAOFormContainer>
      <Flex direction="column" gap="5">
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
            <Text textStyle="p medium semibold">{`${threshold} / ${members.length} members`}</Text>
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
                    checkForValidPositiveNumber({ input: value, maxCapValue: members.length - 1 }) ||
                    "A valid Threshold is required.",
                }),
              },
            }}
            isInvalid={Boolean(errors.newThreshold)}
            errorMessage={errors.newThreshold && errors.newThreshold.message}
          />
          <Text flex="1" textStyle="p medium semibold" paddingTop="0.8rem">
            {`/ ${members.length - 1} members`}
          </Text>
        </Flex>
      </Flex>
    </DAOFormContainer>
  );
}
