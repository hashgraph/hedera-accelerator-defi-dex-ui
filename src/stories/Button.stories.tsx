import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button } from "../components";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Button",
  component: Button,
  parameters: {
    docs: {
      page: "Button",
    },
  },
} as ComponentMeta<typeof Button>;

export const Basic: ComponentStory<typeof Button> = (args) => <Button {...args}>Connect</Button>;
