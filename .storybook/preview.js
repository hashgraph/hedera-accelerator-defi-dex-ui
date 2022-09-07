import { themes } from "@storybook/theming";
import HederaDeFiTheme from "./HederaDeFiTheme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    theme: HederaDeFiTheme
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
};
