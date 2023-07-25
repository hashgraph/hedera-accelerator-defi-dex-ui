import { Container, Flex } from "@chakra-ui/react";
import { PageFooter, TopMenuBar } from "@layouts";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@utils";
import { useWalletConnection } from "@hooks";

const menuOptions = ["Swap", "Pools", "Governance", "DAOs"];

export function AppLayout() {
  useWalletConnection();
  return (
    <>
      <ScrollToTop />
      <TopMenuBar menuOptions={menuOptions} />
      <Container layerStyle="body">
        <Flex width="100%" minHeight="inherit">
          <Outlet />
        </Flex>
      </Container>
      <PageFooter />
    </>
  );
}
