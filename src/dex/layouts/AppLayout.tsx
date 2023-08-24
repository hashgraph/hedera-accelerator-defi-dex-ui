import { Container, Flex } from "@chakra-ui/react";
import { PageFooter, TopMenuBar } from "@dex/layouts";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@dex/utils";
import { useWalletConnection } from "@dex/hooks";

interface AppLayoutProps {
  navOptions: string[];
}

export function AppLayout(props: AppLayoutProps) {
  const { navOptions } = props;
  useWalletConnection();
  return (
    <>
      <ScrollToTop />
      <TopMenuBar menuOptions={navOptions} />
      <Container layerStyle="body">
        <Flex width="100%" minHeight="inherit">
          <Outlet />
        </Flex>
      </Container>
      <PageFooter />
    </>
  );
}
