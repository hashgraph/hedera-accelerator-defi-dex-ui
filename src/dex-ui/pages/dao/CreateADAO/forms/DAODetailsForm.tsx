import {
  FormControl,
  Flex,
  Image,
  Text,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  SimpleGrid,
  Checkbox,
} from "@chakra-ui/react";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { FormInput, FormTextArea, FormInputList, DefaultLogoIcon, Color } from "@dex-ui-components";
import { CreateADAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { useState } from "react";

export function DAODetailsForm() {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<CreateADAOForm>();
  const daoDetails = getValues();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "daoLinks",
  });

  const [imageUrl, setImageUrl] = useState(() => {
    return daoDetails.logoUrl ?? "";
  });

  function handleLogoUrlChange(event: any) {
    setImageUrl(event.target.value);
  }

  return (
    <DAOFormContainer>
      <FormInput<"name">
        inputProps={{
          id: "name",
          label: "Name",
          type: "text",
          placeholder: "Enter the name of your DAO",
          register: {
            ...register("name", {
              required: { value: true, message: "A name is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors.name)}
        errorMessage={errors.name && errors.name.message}
      />
      <FormTextArea<"description">
        textAreaProps={{
          id: "description",
          label: "Description",
          placeholder: "Add a description for your DAO",
          register: {
            ...register("description", {
              required: { value: true, message: "A description is required." },
              validate: (value) => value.length <= 240 || "Maximum character count for the description is 240.",
            }),
          },
        }}
        isInvalid={Boolean(errors.description)}
        errorMessage={errors.description && errors.description.message}
      />
      <Flex direction="row" gap="10px" justifyContent="flex-end">
        <FormInput<"logoUrl">
          inputProps={{
            id: "logoUrl",
            label: "Logo",
            type: "text",
            placeholder: "Enter image URL",
            register: {
              ...register("logoUrl", {
                onChange: handleLogoUrlChange,
              }),
            },
          }}
          isInvalid={Boolean(errors.logoUrl)}
          errorMessage={errors.logoUrl && errors.logoUrl.message}
        />
        <Image
          src={imageUrl}
          objectFit="contain"
          alt="Logo URl"
          alignSelf="end"
          boxSize="4rem"
          fallback={<DefaultLogoIcon boxSize="4rem" alignSelf="end" color={Color.Grey_Blue._100} />}
        />
      </Flex>
      {/* TODO: Create independent component for form checkboxes */}
      <FormControl>
        <Controller
          control={control}
          name="isPublic"
          key="isPublic"
          defaultValue={true}
          render={({ field: { onChange, value, ref } }) => {
            return (
              <Checkbox onChange={onChange} ref={ref} isChecked={value}>
                List DAO publicly
              </Checkbox>
            );
          }}
        />
      </FormControl>
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          <Text textStyle="p medium medium">
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                DAO Links
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Text>
          <AccordionPanel pb={4}>
            <SimpleGrid row={1} spacingX="1rem" spacingY="0.75rem">
              <FormInputList<CreateADAOForm, "daoLinks">
                fields={fields}
                defaultFieldValue={{ value: "" }}
                formPath="daoLinks"
                fieldPlaceholder="Enter URL"
                fieldLabel=""
                fieldButtonText="+ Add Link"
                append={append}
                remove={remove}
                register={register}
              />
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </DAOFormContainer>
  );
}
