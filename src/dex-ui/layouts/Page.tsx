import { Box, Grid, GridItem } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Color } from "../../dex-ui-components";

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
  const pageBodyPadding = type === PageLayout.Page ? "0px 80px 80px 80px" : "0";
  return (
    <Grid templateColumns="repeat(1, 1fr)" gap={gap} width="100%" height="100%" bg={Color.White_02}>
      {props.header ? <GridItem colSpan={1}>{props.header}</GridItem> : <></>}
      <GridItem colSpan={1}>
        <Box minHeight="100%" padding={pageBodyPadding}>
          {props.body}
        </Box>
      </GridItem>
    </Grid>
  );
}
