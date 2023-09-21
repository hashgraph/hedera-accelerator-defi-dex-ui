import { Flex } from "@chakra-ui/react";
import { Text, Color } from "@shared/ui-kit";

interface ProposalDetailsDescriptionProps {
  description: string[];
}

export function ProposalDetailsDescription(props: ProposalDetailsDescriptionProps) {
  const { description } = props;
  const DescriptionFormatted = (
    <>
      {description.map((text: string, index) => (
        <Text.P_Small_Regular color={Color.Neutral._700} key={index}>
          {text}
        </Text.P_Small_Regular>
      ))}
    </>
  );

  return (
    <Flex direction="column" gap="2" width="100%">
      <Text.P_Small_Medium>Description</Text.P_Small_Medium>
      {DescriptionFormatted}
    </Flex>
  );
}
