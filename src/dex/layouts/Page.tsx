import { Box, Flex } from "@chakra-ui/react";
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
  const pageBodyPadding = type === PageLayout.Page ? "0rem 5rem 5rem 5rem" : "0rem";
  return (
    <Flex direction="column" gap={gap} width="100%" minHeight={`calc(100vh - ${BodyHeight}px`}>
      {props.header ? <Box maxHeight="fit-content">{props.header}</Box> : <></>}
      <Box flexGrow="1" padding={pageBodyPadding}>
        {props.body}
      </Box>
    </Flex>
  );
}
