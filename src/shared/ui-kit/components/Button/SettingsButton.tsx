import { Text, Button } from "@chakra-ui/react";
import { Color } from "../../themes";
import { CogIcon } from "../Icons";

interface SettingsButtonProps {
  isError?: boolean;
  display: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function SettingsButton(props: SettingsButtonProps) {
  return (
    <Button
      data-testid="settings-button"
      variant="settings"
      aria-label="Open and close settings modal."
      leftIcon={<CogIcon />}
      borderColor={props.isError ? Color.Red_01 : Color.Text_Primary}
      onClick={props.onClick}
    >
      <Text textStyle="h4" minWidth="2.5rem">
        {props.display}
      </Text>
    </Button>
  );
}
