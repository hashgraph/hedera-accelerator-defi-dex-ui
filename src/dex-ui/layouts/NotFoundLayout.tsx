import { Text, Box, Flex, Link } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";

interface NotFoundProps {
  message: string;
  preLinkText?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export function NotFound(props: NotFoundProps) {
  const { message, preLinkText, onLinkClick, linkText } = props;
  return (
    <Flex width="100%" height="70vh" bg={Color.Primary_Bg} justifyContent="center" alignItems="center">
      <Box width="fit-content" margin="auto">
        <Text textStyle="h3" marginBottom="0.5rem">
          {message}
        </Text>
        <Flex alignItems="center">
          <Text textStyle="b2">{preLinkText}</Text>
          <Link color={Color.Teal_01} onClick={onLinkClick}>
            <Text variant="link">{linkText}</Text>
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
}
