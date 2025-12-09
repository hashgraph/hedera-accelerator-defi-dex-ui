import { Flex, Link, Box, Button } from "@chakra-ui/react";
import { Text, Color, useTheme } from "@shared/ui-kit";
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
  const theme = useTheme();

  return (
    <Flex width="100%" height="100%" flex="1" justifyContent="center" alignItems="center" padding={8}>
      <Flex
        direction="column"
        width="fit-content"
        margin="auto"
        alignItems="center"
        padding={8}
        borderRadius="12px"
        backgroundColor={theme.bgSecondary}
        border={`1px solid ${theme.border}`}
      >
        <Box marginBottom="1.5rem" opacity={0.7}>
          {icon}
        </Box>
        <Text.P_Large_Semibold color={theme.text} marginBottom="1rem" textAlign="center">
          {message}
        </Text.P_Large_Semibold>
        {linkText && (
          <Button
            variant="primary"
            size="md"
            onClick={onLinkClick}
            backgroundColor={Color.Primary._500}
            color="white"
            _hover={{ backgroundColor: Color.Primary._600 }}
            borderRadius="8px"
            paddingX={6}
          >
            {preLinkText} {linkText}
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
