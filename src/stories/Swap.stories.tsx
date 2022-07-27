import * as React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Swap } from "../components";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Swap",
  component: Swap,
} as ComponentMeta<typeof Swap>;

export const Basic: ComponentStory<typeof Swap> = (args) => <Swap {...args} />;

export const ETH_to_USDC = Basic.bind({});

ETH_to_USDC.args = {
  inputToken: {
    symbol: "ETH",
    amount: 0.01,
  },
  outputToken: {
    symbol: "USDC",
    amount: 100,
  },
};

export const BAT_to_HBAR = Basic.bind({});

BAT_to_HBAR.args = {
  inputToken: {
    symbol: "BAT",
    amount: 0.01123123,
  },
  outputToken: {
    symbol: "HBAR",
    amount: 10120,
  },
};
