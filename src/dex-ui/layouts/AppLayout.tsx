import { Container, Flex } from "@chakra-ui/react";
import { TopMenuBar } from "@layouts";
import { Color } from "@dex-ui-components";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@utils";
import { useWalletConnection } from "@hooks";

const menuOptions = ["Swap", "Pools", "Governance", "DAOs"];

export function AppLayout() {
  useWalletConnection();
  return (
    <>
      <ScrollToTop />
      <Container color="black" w="100%" maxWidth="100%" height="100vh" bg={Color.White_02} padding="0" margin="0">
        <TopMenuBar menuOptions={menuOptions} />
        <Flex width="100%" minHeight="100%" paddingBottom="2rem">
          <Outlet />
        </Flex>
      </Container>
    </>
  );
}
