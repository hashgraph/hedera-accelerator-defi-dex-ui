import { DEXTheme } from "../src/dex-ui/theme";
import HederaDeFiTheme from "./HederaDeFiTheme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    theme: HederaDeFiTheme,
  },
  chakra: {
    theme: DEXTheme,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
