import { Checkbox, FormControl, FormErrorMessage } from "@chakra-ui/react";
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
        布聽足上尾化書美尾喝里火行明己還我停肖拉。汁們就士消草以又巴朱走媽登；怕哥看婆化婆苗話封同胡汁七；星或安假過香米古入向具耍。
        蝴苦里力坡友點麻更重婆夏做卜至只午欠經。
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
