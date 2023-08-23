import { DefaultTheme } from "../src/shared/ui-kit/themes";
import HederaDeFiTheme from "./HederaDeFiTheme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    theme: HederaDeFiTheme,
  },
  chakra: {
    theme: DefaultTheme,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
