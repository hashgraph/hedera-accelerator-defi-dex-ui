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
      "@dao": path.resolve(__dirname, "../src/dao"),
      "@dao/routes": path.resolve(__dirname, "../src/dao/routes"),
      "@dex": path.resolve(__dirname, "../src/dex"),
      "@dex/components": path.resolve(__dirname, "../src/dex/components"),
      "@dex/context": path.resolve(__dirname, "../src/dex/context"),
      "@dex/hooks": path.resolve(__dirname, "../src/dex/hooks"),
      "@dex/layouts": path.resolve(__dirname, "../src/dex/layouts"),
      "@dex/pages": path.resolve(__dirname, "../src/dex/pages"),
      "@dex/services": path.resolve(__dirname, "../src/dex/services"),
      "@dex/store": path.resolve(__dirname, "../src/dex/store"),
      "@dex/theme": path.resolve(__dirname, "../src/dex/theme"),
      "@dex/routes": path.resolve(__dirname, "../src/dex/routes"),
      "@dex/utils": path.resolve(__dirname, "../src/dex/utils"),
      "@shared/ui-kit": path.resolve(__dirname, "../src/dex-ui-components"),
    };
    return config;
  },
};
