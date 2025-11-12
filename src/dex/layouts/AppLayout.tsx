import { Container, Flex } from "@chakra-ui/react";
import { PageFooter, TopMenuBar } from "@dex/layouts";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@dex/utils";
import { useWalletConnection } from "@dex/hooks";

interface AppLayoutProps {
  navOptions: string[];
  hideFooter?: boolean;
  brandText?: string;
}

export function AppLayout(props: AppLayoutProps) {
  const { navOptions, hideFooter = false, brandText } = props;
  useWalletConnection();
  return (
    <>
      <ScrollToTop />
      <TopMenuBar menuOptions={navOptions} brandText={brandText} />
      <Container layerStyle="body">
        <Flex width="100%" minHeight="inherit">
          <Outlet />
        </Flex>
      </Container>
      {!hideFooter && <PageFooter />}
    </>
  );
}
