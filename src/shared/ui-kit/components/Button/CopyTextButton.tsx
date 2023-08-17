import { IconButton } from "@chakra-ui/react";
import { Color } from "../../themes";
import { CopyIcon } from "../Icons";

interface CopyTextButtonProps {
  onClick: () => void;
  buttonSize?: "xs" | "sm" | "md" | "lg";
  iconSize?: string;
}

export function CopyTextButton(props: CopyTextButtonProps) {
  const { onClick, iconSize = "4", buttonSize = "xs" } = props;
  return (
    <IconButton
      size={buttonSize}
      aria-label="copy-text-to-clipboard"
      variant="link"
      onClick={() => onClick()}
      icon={<CopyIcon boxSize={iconSize} color={Color.Neutral._500} />}
    />
  );
}
