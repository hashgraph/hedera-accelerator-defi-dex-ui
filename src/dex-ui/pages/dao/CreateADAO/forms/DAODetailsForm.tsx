import { Checkbox, FormControl } from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";
import { FormInput } from "../../../../../dex-ui-components";
import { CreateADAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";

export function DAODetailsForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateADAOForm>();
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
      {/* TODO: For a future version of the form.
        <FormInput<"description">
          inputProps={{
            id: "description",
            label: "Description",
            type: "text",
            placeholder: "Add a description for your DAO",
            register: {
              ...props.register("description", {
                required: { value: true, message: "A description is required." },
              }),
            },
          }}
          isInvalid={Boolean(props.errors.description)}
          errorMessage={props.errors.description && props.errors.description.message}
        /> 
      */}
      <FormInput<"logoUrl">
        inputProps={{
          id: "logoUrl",
          label: "Logo",
          type: "text",
          placeholder: "Enter image URL",
          register: {
            ...register("logoUrl", { required: { value: true, message: "A logo url is required." } }),
          },
        }}
        isInvalid={Boolean(errors.logoUrl)}
        errorMessage={errors.logoUrl && errors.logoUrl.message}
      />
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
    </DAOFormContainer>
  );
}
