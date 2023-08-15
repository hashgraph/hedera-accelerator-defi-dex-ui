import { Container, Flex } from "@chakra-ui/react";
import { PageFooter, TopMenuBar } from "@dex/layouts";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@dex/utils";
import { useWalletConnection } from "@dex/hooks";
import { MenuOptions } from "../../index";

export function AppLayout() {
  useWalletConnection();
  return (
    <>
      <ScrollToTop />
      <TopMenuBar menuOptions={MenuOptions} />
      <Container layerStyle="body">
        <Flex width="100%" minHeight="inherit">
          <Outlet />
        </Flex>
      </Container>
      <PageFooter />
    </>
  );
}
