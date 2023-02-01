import { Text } from "@chakra-ui/react";
import { isNil } from "ramda";
import { SettingsIcon } from "../Icons";
import { Button } from "./Button";

interface SettingsButtonProps {
  slippage: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function SettingsButton(props: SettingsButtonProps) {
  const formattedSlippage = !isNil(props.slippage) ? `${Number(props.slippage)?.toFixed(1)}%` : "-.-%";
  return (
    <Button
      data-testid="settings-button"
      variant="settings"
      aria-label="Open and close settings modal."
      leftIcon={<SettingsIcon />}
      onClick={props.onClick}
    >
      <Text textStyle="h4">{formattedSlippage}</Text>
    </Button>
  );
}
