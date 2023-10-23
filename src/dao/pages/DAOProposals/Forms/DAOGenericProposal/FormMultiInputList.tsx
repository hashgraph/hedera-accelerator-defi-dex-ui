import { FieldError, useFieldArray, useFormContext } from "react-hook-form";
import { FormInput } from "@shared/ui-kit";
import { Flex } from "@chakra-ui/react";
import { Argument, CreateDAOGenericProposalForm } from "../../types";
import {
  SolidityArray,
  SolidityAddress,
  SolidityBool,
  SolidityBytes,
  SolidityFunction,
  SolidityInt,
  SolidityString,
  SolidityTuple,
} from "abitype/zod";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import get from "lodash/get";

function doesStartWithVowel(char: string) {
  return /[aeiou]/i.test(char.toLowerCase());
}

interface ArgumentInputsProps {
  root: string;
  position?: string;
  level?: number;
}

export function ArgumentsInputList(props: ArgumentInputsProps) {
  const { root, position = "", level = 0 } = props;
  const isChildFieldArray = level > 0;
  const fieldArrayName = isChildFieldArray ? position : root;
  const {
    control,
    formState: { errors },
    setValue,
    register,
  } = useFormContext<CreateDAOGenericProposalForm>();
  const { fields } = useFieldArray({
    control,
    name: fieldArrayName as any,
  });

  function validateSolidityParam(abiType: string, value: string, index: number): true | string {
    if (SolidityString.safeParse(abiType).success) {
      if (value?.length > 0) {
        setValue(`${fieldArrayName}.${index}.transformedValue` as any, value);
        return true;
      }
      return "A value is required.";
    }
    if (SolidityAddress.safeParse(abiType).success) {
      if (ethers.utils.isAddress(value) || ethers.constants.AddressZero === value) {
        setValue(`${fieldArrayName}.${index}.transformedValue` as any, value);
        return true;
      }
      return "Invalid address.";
    }
    if (SolidityBool.safeParse(abiType).success) {
      const boolValue = value.toLowerCase();
      if (boolValue === "true" || boolValue === "false") {
        setValue(`${fieldArrayName}.${index}.transformedValue` as any, boolValue === "true");
        return true;
      }
      return "'true' or 'false' is required.";
    }
    if (SolidityBytes.safeParse(abiType).success) {
      if (ethers.utils.isBytesLike(value)) {
        setValue(`${fieldArrayName}.${index}.transformedValue` as any, value);
        return true;
      }
      return "Invalid bytes.";
    }
    if (SolidityFunction.safeParse(abiType).success) {
      /** TODO: Add validations for Function type inputs. */
      if (value?.length > 0) {
        setValue(`${fieldArrayName}.${index}.transformedValue` as any, value);
        return true;
      }
      return "A value is required.";
    }
    if (SolidityInt.safeParse(abiType).success) {
      const parsedNumber = BigNumber(value);
      if (!parsedNumber.isNaN()) {
        setValue(`${fieldArrayName}.${index}.transformedValue` as any, parsedNumber.toNumber());
        return true;
      }
      return "Invalid integer.";
    }
    if (SolidityTuple.safeParse(abiType).success) {
      if (value?.length > 0) {
        setValue(`${fieldArrayName}.${index}.transformedValue` as any, value);
        return true;
      }
      return "A value is required.";
    }

    if (SolidityArray.safeParse(abiType).success) {
      console.log(value);
      let parsedArray;
      try {
        parsedArray = JSON.parse(value);
      } catch (error) {
        return "Invalid array.";
      }
      if (Array.isArray(parsedArray)) {
        const arrayType = abiType.replace("[]", "");
        /** TODO: Cover validations for all array types **/
        const parseArrayType = arrayType.includes("int") ? "number" : arrayType.includes("bool") ? "boolean" : "string";
        const areValuesValid = parsedArray.every((value: unknown) => typeof value === parseArrayType);
        if (areValuesValid) {
          setValue(`${fieldArrayName}.${index}.transformedValue` as any, parsedArray);
          return true;
        }
        return `All array values must be of type '${arrayType}'.`;
      }
    }
    return "All arguments must have a valid type.";
  }

  return (
    <Flex direction="column">
      {fields.map((baseField, index) => {
        const field = baseField as Argument & typeof baseField;
        const argumentError = get(errors, `${fieldArrayName}.${index}.name`) as FieldError | undefined;
        const valueError = get(errors, `${fieldArrayName}.${index}.inputValue`) as FieldError | undefined;
        const isTuple = SolidityTuple.safeParse(field.type).success;
        isTuple && setValue(`${fieldArrayName}.${index}.inputValue` as any, field.internalType);

        return (
          <>
            <Flex key={field.id} direction="row" gap="2" marginLeft={`${level * 1.5}rem`}>
              <FormInput
                inputProps={{
                  id: `${field.id}-argument`,
                  type: "text",
                  label: index === 0 ? `Arguments (${fields.length})` : "",
                  placeholder: "Enter an argument",
                  register: {
                    ...register(`${fieldArrayName}.${index}.name` as any, {
                      required: { value: true, message: "An argument name must be available." },
                    }),
                  },
                  value: `${field.name} (${field.type})` ?? "",
                  isDisabled: true,
                }}
                isInvalid={Boolean(argumentError)}
                errorMessage={argumentError && argumentError?.message}
              />
              <FormInput
                inputProps={{
                  id: `${field.id}-value`,
                  type: "text",
                  label: index === 0 ? "Value" : "",
                  placeholder: isTuple
                    ? field.internalType
                    : `Enter ${doesStartWithVowel(field.type.charAt(0)) ? "an" : "a"} ${field.type}`,
                  register: {
                    ...register(`${fieldArrayName}.${index}.inputValue` as any, {
                      required: { value: true, message: "A value is required." },
                      validate: (value) => validateSolidityParam(field.type, value, index),
                    }),
                  },
                  isDisabled: isTuple,
                }}
                isInvalid={Boolean(valueError)}
                errorMessage={valueError && valueError?.message}
              />
            </Flex>
            {isTuple ? (
              <ArgumentsInputList
                root="functionArguments"
                position={`${fieldArrayName}.${index}.components`}
                level={level + 1}
              />
            ) : (
              <></>
            )}
          </>
        );
      })}
    </Flex>
  );
}
