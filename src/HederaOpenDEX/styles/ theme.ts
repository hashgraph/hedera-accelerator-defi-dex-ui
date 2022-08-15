import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles, NumberInputStyles } from "../../components/base";

export const HederaOpenDexTheme = extendTheme({
  components: {
    Button: ButtonStyles,
    NumberInput: NumberInputStyles,
  },
});
