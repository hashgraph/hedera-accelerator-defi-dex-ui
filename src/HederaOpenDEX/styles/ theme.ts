import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles, NumberInputStyles, NumberInputFieldStyles } from "../../components/base";

export const HederaOpenDexTheme = extendTheme({
  components: {
    Button: ButtonStyles,
    NumberInput: NumberInputStyles,
    NumberInputField: NumberInputFieldStyles,
  },
});
