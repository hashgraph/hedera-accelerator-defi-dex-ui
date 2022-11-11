import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button } from "..";

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

const Template: ComponentStory<typeof Button> = (args: any) => <Button {...args}>Button</Button>;

export const Primary: ComponentStory<typeof Button> = Template.bind({});
Primary.args = { variant: "primary" };

export const Secondary: ComponentStory<typeof Button> = Template.bind({});
Secondary.args = { variant: "Secondary" };

export const Tertiary: ComponentStory<typeof Button> = Template.bind({});
Tertiary.args = { variant: "tertiary" };
