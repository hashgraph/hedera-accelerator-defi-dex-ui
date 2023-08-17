import {
  ArrayPath,
  FieldArray,
  FieldArrayWithId,
  FieldValues,
  Path,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";
import { FormInput, CancelledStepIcon, Color } from "../..";
import { Flex, IconButton, Button } from "@chakra-ui/react";

interface FormInputListProps<FormType extends FieldValues, FormPath extends ArrayPath<FormType>> {
  fields: FieldArrayWithId<FormType, FormPath, "id">[];
  defaultFieldValue: FieldArray<FormType, FormPath> | FieldArray<FormType, FormPath>[];
  formPath: FormPath;
  fieldLabel: string;
  fieldPlaceholder: string;
  fieldButtonText: string;
  append: UseFieldArrayAppend<FormType, FormPath>;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<FormType>;
}

export function FormInputList<FormType extends FieldValues, FormPath extends ArrayPath<FormType>>(
  props: FormInputListProps<FormType, FormPath>
) {
  const {
    fields,
    defaultFieldValue,
    formPath,
    register,
    append,
    remove,
    fieldLabel,
    fieldPlaceholder,
    fieldButtonText,
  } = props;
  function handleAddInputClicked() {
    append(defaultFieldValue);
  }

  function handleRemoveInputClicked(inputIndex: number) {
    remove(inputIndex);
  }

  return (
    <>
      {fields.map((field, index) => {
        return (
          <Flex key={index} alignItems="end" gap="0.5rem" paddingRight="0.5rem">
            <FormInput
              flex="5"
              inputProps={{
                id: field.id,
                type: "text",
                label: fieldLabel,
                placeholder: fieldPlaceholder,
                register: { ...register(`${formPath}.${index}.value` as Path<FormType>) },
              }}
            />
            <IconButton
              size="xs"
              variant="link"
              marginLeft="0.25rem"
              marginBottom="1.2rem"
              aria-label="remove-multisig-member"
              onClick={() => handleRemoveInputClicked(index)}
              icon={<CancelledStepIcon boxSize="6" color={Color.Grey_Blue._500} />}
            />
          </Flex>
        );
      })}
      {fieldButtonText.length > 0 ? (
        <Button paddingLeft="0.5rem" variant="link" onClick={handleAddInputClicked}>
          {fieldButtonText}
        </Button>
      ) : undefined}
    </>
  );
}
