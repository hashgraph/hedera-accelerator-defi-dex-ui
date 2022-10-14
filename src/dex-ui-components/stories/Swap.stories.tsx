import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Swap } from "..";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Swap",
  component: Swap,
  parameters: {
    docs: {
      page: "Swap",
    },
  },
} as ComponentMeta<typeof Swap>;

export const Basic: ComponentStory<typeof Swap> = (args) => <Swap {...args} />;
