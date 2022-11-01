import { extendTheme } from "@chakra-ui/react";
import { TextStyles, ButtonStyles, NumberInputStyles, CardStyles } from "../../dex-ui-components/base";

export const DEXTheme = extendTheme({
  textStyles: TextStyles,
  components: {
    Button: ButtonStyles,
    NumberInput: NumberInputStyles,
    Card: CardStyles,
  },
});
