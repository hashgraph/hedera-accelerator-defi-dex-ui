import { FileUploader, FormDropdown, FormInput, FormTextArea, InlineAlert, InlineAlertType } from "@shared/ui-kit";
import {
  CreateDAOProposalContext,
  CreateDAOGenericProposalForm,
  Argument,
  DAOProposalType,
  AbiTupleParameter,
} from "../../types";
import { useFormContext } from "react-hook-form";
import { isValidUrl } from "@dex/utils";
import { Flex, SimpleGrid } from "@chakra-ui/react";
import { useOutletContext } from "react-router-dom";
import { ChangeEvent, useEffect, useState } from "react";
import { Abi, AbiFunction as ZodAbiFunction } from "abitype/zod";
import {
  Abi as AbiType,
  AbiFunction,
  AbiConstructor,
  AbiError,
  AbiEvent,
  AbiFallback,
  AbiReceive,
  AbiParameter,
} from "abitype";
import { ArgumentsInputList } from "./FormMultiInputList";

type AbiDataType = AbiConstructor | AbiError | AbiEvent | AbiFallback | AbiFunction | AbiReceive;

export function DAOGenericProposalDetailsForm() {
  const { proposalType } = useOutletContext<CreateDAOProposalContext>();
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<CreateDAOGenericProposalForm>();
  const [hasMounted, setHasMounted] = useState(false);

  if (proposalType !== DAOProposalType.Generic) {
    setValue("type", DAOProposalType.Generic);
  }

  watch("functionName", "functionArguments");

  const abiFile = getValues().abiFile?.file;

  function getAbiFunctions() {
    if (abiFile) {
      const abi = parseAbiFile(abiFile);
      return abi ? parseABIFileFunctions(abi) : [];
    }
    return [];
  }

  const [abiFunctions, setAbiFunctions] = useState<AbiFunction[]>(getAbiFunctions());

  const selectableFunctions = abiFunctions
    .filter(
      (abiFunction: AbiFunction) => abiFunction.stateMutability !== "pure" && abiFunction.stateMutability !== "view"
    )
    .map((abiFunction: AbiFunction) => ({
      label: abiFunction?.name,
      value: abiFunction?.name,
    }));

  const selectedFunction = getValues().functionName;

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      setValue("functionName", "");
    }
  }, [abiFile]);

  function transformFunctionArgs(functionInputs: readonly AbiParameter[] | undefined) {
    return (
      functionInputs?.map((arg: AbiParameter): Argument => {
        if (arg.type.includes("tuple")) {
          const tupleArg = arg as AbiTupleParameter;
          return {
            name: tupleArg.name ?? "",
            type: tupleArg.type ?? "",
            internalType: tupleArg.internalType ?? "",
            inputValue: "",
            transformedValue: undefined,
            components: transformFunctionArgs(tupleArg.components),
          };
        }
        return {
          name: arg.name ?? "",
          type: arg.type ?? "",
          internalType: arg.internalType ?? "",
          inputValue: "",
          transformedValue: undefined,
        };
      }) ?? []
    );
  }

  useEffect(() => {
    if (hasMounted) {
      const functionInputs = abiFunctions?.find(
        (abiFunction: AbiFunction) => abiFunction.name === selectedFunction
      )?.inputs;
      const functionArguments = transformFunctionArgs(functionInputs);
      setValue("functionArguments", functionArguments);
    }
  }, [selectedFunction]);

  function parseABIFileFunctions(abiFile: AbiType): AbiFunction[] {
    const abi = Abi.parse(abiFile);
    const abiFunctions: AbiFunction[] = abi
      .filter((abiData: AbiDataType) => {
        return ZodAbiFunction.safeParse(abiData).success;
      })
      .map((abiFunctions: AbiDataType) => abiFunctions as AbiFunction);
    return abiFunctions;
  }

  function parseAbiFile(file: string): AbiType | undefined {
    let fileJSON;
    try {
      fileJSON = JSON.parse(file);
    } catch (error) {
      console.log(error);
      return;
    }
    return fileJSON.abi;
  }

  return (
    <Flex direction="column" gap="1.3rem">
      <FormInput<"title">
        inputProps={{
          id: "title",
          label: "Title",
          type: "text",
          placeholder: "Enter title",
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
      <FormInput<"linkToDiscussion">
        inputProps={{
          id: "linkToDiscussion",
          label: "Link to discussion",
          type: "text",
          placeholder: "Enter URL",
          register: {
            ...register("linkToDiscussion", {
              validate: (value) => isValidUrl(value) || "Invalid URL, Please try again.",
            }),
          },
        }}
        isInvalid={Boolean(errors?.linkToDiscussion)}
        errorMessage={errors?.linkToDiscussion && errors?.linkToDiscussion?.message}
      />
      <FormInput<"targetContractId">
        inputProps={{
          id: "targetContractId",
          label: "Target contract id",
          type: "text",
          placeholder: "Enter a contract id",
          register: {
            ...register("targetContractId", {
              required: { value: true, message: "A contract id is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.targetContractId)}
        errorMessage={errors?.targetContractId && errors?.targetContractId?.message}
      />
      <FileUploader
        id="upload-abi"
        title="Upload ABI File (.json)"
        onHoverTitle="Drag or select an JSON ABI file."
        uploadedFile={getValues().abiFile}
        onFileRead={function (file: string, name: string): void {
          setValue("abiFile", { name, file });
          const abi = parseAbiFile(file);
          setAbiFunctions(abi ? parseABIFileFunctions(abi) : []);
        }}
      />
      <FormDropdown
        label="Select function to execute"
        placeholder="Select a function"
        isDisabled={abiFunctions.length === 0}
        data={selectableFunctions}
        isInvalid={Boolean(errors?.functionName)}
        errorMessage={errors?.functionName && errors?.functionName?.message}
        register={register("functionName", {
          required: { value: true, message: "A function must be selected." },
          onChange: (event: ChangeEvent<HTMLSelectElement>) => {
            setValue("functionName", event.target.value);
          },
        })}
      />
      <SimpleGrid row={1} spacingX="1rem" spacingY="0.75rem">
        <ArgumentsInputList root="functionArguments" />
        {errors?.encodedFunctionData && (
          <InlineAlert message={errors?.encodedFunctionData?.message ?? ""} type={InlineAlertType.Error} />
        )}
      </SimpleGrid>
      <InlineAlert message="Proceed with caution" type={InlineAlertType.Info} />
    </Flex>
  );
}
