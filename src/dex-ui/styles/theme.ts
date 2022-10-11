import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles, NumberInputStyles } from "../../dex-ui-components/base";

export const DEXTheme = extendTheme({
  components: {
    Button: ButtonStyles,
    NumberInput: NumberInputStyles,
  },
});
