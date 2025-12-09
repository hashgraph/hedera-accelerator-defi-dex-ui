import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { BodyHeight } from "@shared/ui-kit";
import { ReactNode } from "react";

export enum PageLayout {
  Dashboard = "Dashboard",
  Page = "Page",
}

interface PageProps {
  header?: ReactNode;
  body?: ReactNode;
  type?: PageLayout;
  gap?: number;
}

export function Page(props: PageProps) {
  const { gap = 8, type = PageLayout.Page } = props;

  // Responsive padding: smaller on mobile, larger on desktop
  const horizontalPadding = useBreakpointValue({
    base: "1rem",
    sm: "1.5rem",
    md: "2rem",
    lg: "3rem",
    xl: "5rem",
  });

  const bottomPadding = useBreakpointValue({
    base: "2rem",
    md: "3rem",
    lg: "5rem",
  });

  const pageBodyPadding =
    type === PageLayout.Page ? `0 ${horizontalPadding} ${bottomPadding} ${horizontalPadding}` : "0rem";

  const responsiveGap = useBreakpointValue({
    base: 4,
    md: 6,
    lg: gap,
  });

  return (
    <Flex direction="column" gap={responsiveGap} width="100%" minHeight={`calc(100vh - ${BodyHeight}px`}>
      {props.header ? <Box maxHeight="fit-content">{props.header}</Box> : <></>}
      <Box flexGrow="1" padding={pageBodyPadding}>
        {props.body}
      </Box>
    </Flex>
  );
}
