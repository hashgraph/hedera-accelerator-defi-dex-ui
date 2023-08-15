import { IconButton } from "@chakra-ui/react";
import { CopyIcon, Color } from "@shared/ui-kit";

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
