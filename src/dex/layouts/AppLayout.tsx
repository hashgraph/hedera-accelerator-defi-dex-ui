import { Container, Flex } from "@chakra-ui/react";
import { PageFooter, TopMenuBar } from "@dex/layouts";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@dex/utils";
import { useWalletConnection } from "@dex/hooks";
import { useTheme, BodyHeight } from "@shared/ui-kit";

interface AppLayoutProps {
  navOptions: string[];
}

export function AppLayout(props: AppLayoutProps) {
  const { navOptions } = props;
  const theme = useTheme();
  useWalletConnection();
  return (
    <>
      <ScrollToTop />
      <TopMenuBar menuOptions={navOptions} />
      <Container
        color={theme.text}
        width="100%"
        maxWidth="100%"
        minHeight={`calc(100vh - ${BodyHeight}px)`}
        height="100%"
        bg={theme.bg}
        padding="0"
        marginTop="4rem"
      >
        <Flex width="100%" minHeight="inherit">
          <Outlet />
        </Flex>
      </Container>
      <PageFooter />
    </>
  );
}
