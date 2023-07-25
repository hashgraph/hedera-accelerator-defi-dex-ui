import { Text, Flex, Box } from "@chakra-ui/react";

interface ErrorLayoutProps {
  message: string | undefined;
}

export function ErrorLayout(props: ErrorLayoutProps) {
  const { message } = props;
  return (
    <Flex minWidth="100%" minHeight="100%" bg="inherit" justifyContent="center" alignItems="center">
      <Box maxWidth="75vw">
        <Text textStyle="h2_empty_or_error" textAlign="center">
          Error: {message ?? "No message found."}
        </Text>
      </Box>
    </Flex>
  );
}
