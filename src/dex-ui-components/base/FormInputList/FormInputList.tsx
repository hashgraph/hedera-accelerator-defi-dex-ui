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
import { Button, FormInput } from "../..";
import { Flex } from "@chakra-ui/react";

interface FormInputListProps<FormType extends FieldValues, FormPath extends ArrayPath<FormType>> {
  fields: FieldArrayWithId<FormType, FormPath, "id">[];
  defaultFieldValue: FieldArray<FormType, FormPath> | FieldArray<FormType, FormPath>[];
  formPath: FormPath;
  append: UseFieldArrayAppend<FormType, FormPath>;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<FormType>;
}

export function FormInputList<FormType extends FieldValues, FormPath extends ArrayPath<FormType>>(
  props: FormInputListProps<FormType, FormPath>
) {
  const { fields, defaultFieldValue, formPath, register, append, remove } = props;
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
          <Flex key={index} alignItems="end">
            <FormInput
              flex="5"
              inputProps={{
                id: field.id,
                type: "text",
                label: "Member wallet address",
                placeholder: "Enter URL",
                register: { ...register(`${formPath}.${index}.value` as Path<FormType>) },
              }}
            />
            <Button marginLeft="0.25rem" marginBottom="0.5rem" onClick={() => handleRemoveInputClicked(index)}>
              Remove
            </Button>
          </Flex>
        );
      })}
      <Flex>
        <Button onClick={handleAddInputClicked}>+ Add</Button>
      </Flex>
    </>
  );
}
