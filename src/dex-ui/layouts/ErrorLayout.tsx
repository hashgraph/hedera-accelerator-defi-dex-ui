import { Text } from "@chakra-ui/react";

interface ErrorLayoutProps {
  message: string | undefined;
}

export function ErrorLayout(props: ErrorLayoutProps) {
  const { message } = props;
  return (
    <Text textStyle="h2_empty_or_error" margin="auto">
      Error: {message ?? "No message found."}
    </Text>
  );
}
