import { Flex, Link, Box } from "@chakra-ui/react";
import { Text, Color } from "@shared/ui-kit";
import { ReactElement } from "react";
import { Link as ReachLink } from "react-router-dom";
interface NotFoundProps {
  icon?: ReactElement;
  message: string;
  preLinkText?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export function NotFound(props: NotFoundProps) {
  const { icon, message, preLinkText, onLinkClick, linkText } = props;
  return (
    <Flex width="100%" height="100%" flex="1" justifyContent="center" alignItems="center">
      <Flex direction="column" width="fit-content" margin="auto" alignItems="center">
        <Box marginBottom="1rem">{icon}</Box>
        <Text.H3_Medium marginBottom="0.5rem">{message}</Text.H3_Medium>
        <Flex alignItems="center" gap={1}>
          <Text.P_Small_Regular>{preLinkText}</Text.P_Small_Regular>
          <Link as={ReachLink} textStyle="p small regular link" color={Color.Primary._500} onClick={onLinkClick}>
            {linkText}
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
}
