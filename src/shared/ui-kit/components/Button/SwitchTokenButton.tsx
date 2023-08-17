import { IconButton } from "@chakra-ui/react";
import { SwitchIcon } from "../Icons";

interface SwitchTokenButtonProps {
  onClick: (event: any) => void;
}

export function SwitchTokenButton(props: SwitchTokenButtonProps) {
  return (
    <IconButton
      data-testid="switch-token-inputs-button"
      variant="switch-token-inputs"
      aria-label="Switch the token amount and symbol input values."
      isRound={true}
      position="absolute"
      zIndex="1000"
      marginRight="3.25rem"
      marginTop="1rem"
      icon={<SwitchIcon />}
      onClick={props.onClick}
    />
  );
}
