import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Notification, NotficationTypes } from "..";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Notification",
  component: Notification,
  parameters: {
    docs: {
      page: "Notification",
    },
  },
} as ComponentMeta<typeof Notification>;

const Template: ComponentStory<typeof Notification> = (args: any) => <Notification {...args} />;

export const Success: ComponentStory<typeof Notification> = Template.bind({});
Success.args = {
  type: NotficationTypes.SUCCESS,
  message: "Swapped 10.0 HBAR for 0.659409 USDT",
  isLinkShown: true,
  linkText: "View in HashScan",
  linkRef: "https://hashscan.io/testnet/dashboard",
  isCloseButtonShown: true,
};

export const Warning: ComponentStory<typeof Notification> = Template.bind({});
Warning.args = {
  type: NotficationTypes.WARNING,
  message: "You’ll need to connect a wallet before you can view balances and swap tokens.",
  isCloseButtonShown: true,
};

export const Error: ComponentStory<typeof Notification> = Template.bind({});
Error.args = {
  type: NotficationTypes.ERROR,
  message: "Not enough USDT available to swap for 10 HBAR.",
};
