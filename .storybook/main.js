const path = require(`path`);

module.exports = {
  stories: ["../src/dex-ui-components/**/*.stories.mdx", "../src/dex-ui-components/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
    "@chakra-ui/storybook-addon",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  features: { emotionAlias: false },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      "@dex-ui": path.resolve(__dirname, "../src/dex-ui"),
      "@components": path.resolve(__dirname, "../src/dex-ui/components"),
      "@context": path.resolve(__dirname, "../src/dex-ui/context"),
      "@hooks": path.resolve(__dirname, "../src/dex-ui/hooks"),
      "@layouts": path.resolve(__dirname, "../src/dex-ui/layouts"),
      "@pages": path.resolve(__dirname, "../src/dex-ui/pages"),
      "@services": path.resolve(__dirname, "../src/dex-ui/services"),
      "@store": path.resolve(__dirname, "../src/dex-ui/store"),
      "@theme": path.resolve(__dirname, "../src/dex-ui/theme"),
      "@routes": path.resolve(__dirname, "../src/dex-ui/routes"),
      "@utils": path.resolve(__dirname, "../src/dex-ui/utils"),
      "@dex-ui-components": path.resolve(__dirname, "../src/dex-ui-components"),
    };
    return config;
  },
};
