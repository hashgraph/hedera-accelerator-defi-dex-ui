import { Text, Flex } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";

interface ProposalDetailsDescriptionProps {
  description: string[];
}

export function ProposalDetailsDescription(props: ProposalDetailsDescriptionProps) {
  const { description } = props;
  const DescriptionFormatted = (
    <>
      {description.map((text: string) => (
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {text}
        </Text>
      ))}
    </>
  );

  return (
    <Flex direction="column" gap="2" width="100%">
      <Text textStyle="p small medium">Description</Text>
      {DescriptionFormatted}
    </Flex>
  );
}
