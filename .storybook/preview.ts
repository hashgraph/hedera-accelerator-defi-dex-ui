import { DefaultTheme } from "../src/shared/ui-kit/themes/defaultTheme";
import HederaDeFiTheme from "./HederaDeFiTheme";
import { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
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
  },
};

export default preview;
