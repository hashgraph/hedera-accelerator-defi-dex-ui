import { Tag as ChakraTag, TagLabel as ChakraTagLabel } from "@chakra-ui/tag";
import { ClockIcon, CogIcon, CheckCircleIcon, XIcon } from "../Icons";
import { TagVariant } from "./tagStyles";

enum TagVariantLabel {
  Active = "Active",
  QueuedToExecute = "Queued to Execute",
  Passed = "Passed",
  Failed = "Failed",
}

const TagLabel: Readonly<{ [key in TagVariant]: TagVariantLabel | null }> = {
  [TagVariant.Active]: TagVariantLabel.Active,
  [TagVariant.Queued]: TagVariantLabel.QueuedToExecute,
  [TagVariant.Succeeded]: TagVariantLabel.Passed,
  [TagVariant.Failed]: TagVariantLabel.Failed,
  [TagVariant.Primary]: null,
  [TagVariant.Secondary]: null,
};

const TagIcon: Readonly<{ [key in TagVariant]: JSX.Element }> = {
  [TagVariant.Active]: <ClockIcon boxSize="4" />,
  [TagVariant.Queued]: <CogIcon boxSize="3" />,
  [TagVariant.Succeeded]: <CheckCircleIcon boxSize="4" />,
  [TagVariant.Failed]: <XIcon boxSize="2.5" />,
  [TagVariant.Primary]: <></>,
  [TagVariant.Secondary]: <></>,
};

interface TagProps {
  variant?: TagVariant;
  label?: string;
}

export function Tag(props: TagProps) {
  const { variant = TagVariant.Primary, label } = props;
  return (
    <ChakraTag variant={variant} height="fit-content">
      {TagIcon[variant]}
      <ChakraTagLabel>{label ?? TagLabel[variant]}</ChakraTagLabel>
    </ChakraTag>
  );
}
