import { ComponentStory, ComponentMeta } from "@storybook/react";
import { SwapTokens } from "..";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "SwapTokens",
  component: SwapTokens,
  parameters: {
    docs: {
      page: "SwapTokens",
    },
  },
} as ComponentMeta<typeof SwapTokens>;

export const Basic: ComponentStory<typeof SwapTokens> = (args) => <SwapTokens {...args} />;
