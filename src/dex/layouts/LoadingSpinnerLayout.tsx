import { Flex, Spinner } from "@chakra-ui/react";
import { Color } from "../../shared/ui-kit";

export function LoadingSpinnerLayout() {
  return (
    <Flex minWidth="100%" minHeight="100%" bg="inherit" justifyContent="center" alignItems="center">
      <Spinner width="5rem" height="5rem" thickness="4px" color={Color.Primary._500} />
    </Flex>
  );
}
