const path = require(`path`);

module.exports = {
  stories: ["../src/shared/ui-kit/**/*.stories.mdx", "../src/shared/ui-kit/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
    "@chakra-ui/storybook-addon",
    "@storybook/addon-mdx-gfm"
  ],

  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },

  features: { emotionAlias: false },

  webpackFinal: async (config) => {
    config.resolve.alias = {
      "@dao": path.resolve(__dirname, "../src/dao"),
      "@dao/routes": path.resolve(__dirname, "../src/dao/routes"),
      "@dao/pages": path.resolve(__dirname, "../src/dao/pages"),
      "@dao/hooks": path.resolve(__dirname, "../src/dao/hooks"),
      "@dao/services": path.resolve(__dirname, "../src/dao/services"),
      "@dex": path.resolve(__dirname, "../src/dex"),
      "@dex/components": path.resolve(__dirname, "../src/dex/components"),
      "@dex/context": path.resolve(__dirname, "../src/dex/context"),
      "@dex/hooks": path.resolve(__dirname, "../src/dex/hooks"),
      "@dex/layouts": path.resolve(__dirname, "../src/dex/layouts"),
      "@dex/pages": path.resolve(__dirname, "../src/dex/pages"),
      "@dex/services": path.resolve(__dirname, "../src/dex/services"),
      "@dex/store": path.resolve(__dirname, "../src/dex/store"),
      "@dex/routes": path.resolve(__dirname, "../src/dex/routes"),
      "@dex/utils": path.resolve(__dirname, "../src/dex/utils"),
      "@shared/ui-kit": path.resolve(__dirname, "../src/shared/ui-kit"),
      "@shared/services": path.resolve(__dirname, "../src/shared/services"),
      "@shared/utils": path.resolve(__dirname, "../src/shared/utils"),
    };
    return config;
  },

  docs: {
    autodocs: true
  }
};
