import { Flex, Spinner } from "@chakra-ui/react";
import { Color } from "../../dex-ui-components";

export function LoadingSpinnerLayout() {
  return (
    <Flex width="100%" height="50vh" bg="inherit" justifyContent="center" alignItems="center">
      <Spinner width="5rem" height="5rem" thickness="4px" color={Color.Primary._500} />
    </Flex>
  );
}
