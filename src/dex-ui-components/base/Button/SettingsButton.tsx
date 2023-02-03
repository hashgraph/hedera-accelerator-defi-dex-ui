import { Text } from "@chakra-ui/react";
import { Color } from "../..";
import { DefaultPercent } from "../../../dex-ui/utils";
import { SettingsIcon } from "../Icons";
import { Button } from "./Button";

interface SettingsButtonProps {
  isError?: boolean;
  slippage: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function SettingsButton(props: SettingsButtonProps) {
  const formattedSlippage = props.slippage > 0 ? `${Number(props.slippage)?.toFixed(2)}%` : DefaultPercent;
  return (
    <Button
      data-testid="settings-button"
      variant="settings"
      aria-label="Open and close settings modal."
      leftIcon={<SettingsIcon />}
      borderColor={props.isError ? Color.Red_01 : Color.Text_Primary}
      onClick={props.onClick}
    >
      <Text textStyle="h4">{formattedSlippage}</Text>
    </Button>
  );
}
