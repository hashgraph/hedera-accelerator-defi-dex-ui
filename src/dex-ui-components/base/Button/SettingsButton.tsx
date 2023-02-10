import { Text, Flex } from "@chakra-ui/react";
import { isNil } from "ramda";
import { SettingsIcon } from "../Icons";
import { Button } from "./Button";

interface SettingsButtonProps {
  slippage?: number;
  transactionDeadLine?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function SettingsButton(props: SettingsButtonProps) {
  const formattedSlippage = !isNil(props.slippage) ? `${Number(props.slippage)?.toFixed(1)}%` : "-.-%";
  const transactionDeadLine = !isNil(props.transactionDeadLine) ? `${Number(props.transactionDeadLine)} min` : "";
  return (
    <Flex>
      {formattedSlippage !== "-.-%" && (
        <Button
          data-testid="settings-button"
          variant="settings"
          aria-label="Open and close settings modal."
          leftIcon={<SettingsIcon />}
          onClick={props.onClick}
        >
          <Text textStyle="h4">{formattedSlippage}</Text>
        </Button>
      )}
      {transactionDeadLine && (
        <Button
          data-testid="settings-button"
          variant="settings"
          aria-label="Open and close settings modal."
          leftIcon={<SettingsIcon />}
          onClick={props.onClick}
        >
          <Text textStyle="h4">{transactionDeadLine}</Text>
        </Button>
      )}
    </Flex>
  );
}
