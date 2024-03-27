import { Checkbox, FormControl, FormErrorMessage, Link } from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";
import { CreateADAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";

export function DAODisclaimerForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateADAOForm>();

  return (
    <DAOFormContainer>
      <p>
        By creating a DAO using this site, you represent, warrant, and agree that your use is consistent with our&nbsp;
        <Link
          textDecoration={"underline"}
          color={"#3078FF"}
          isExternal={true}
          href="https://swirldslabs.com/terms-of-service/"
        >
          Terms of Service
        </Link>
        , does not constitute a Prohibited Use under Section 6, and that any account (wallet address) into which you
        generate DAO tokens is an account that you own and control.
      </p>

      <FormControl isInvalid={Boolean(errors.disclaimer)}>
        <Controller
          control={control}
          key="disclaimer"
          {...register("disclaimer", {
            required: { value: true, message: "You need to accept the terms" },
          })}
          defaultValue={false}
          render={({ field: { onChange, value, ref } }) => {
            return (
              <Checkbox onChange={onChange} ref={ref} isChecked={value} required={true} defaultValue={undefined}>
                I Agree to the above terms and conditions
              </Checkbox>
            );
          }}
        />
        <FormErrorMessage>{errors.disclaimer && errors.disclaimer.message}</FormErrorMessage>
      </FormControl>
    </DAOFormContainer>
  );
}
