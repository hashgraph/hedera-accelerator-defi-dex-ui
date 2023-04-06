import { Grid, GridItem } from "@chakra-ui/react";
import { ReactNode } from "react";
import { PageBody } from "./PageBody";

interface DashboardLayoutProps {
  header?: ReactNode;
  body?: ReactNode;
}

export function DashboardLayout(props: DashboardLayoutProps) {
  const { header, body } = props;
  return (
    <Grid templateColumns="repeat(5, 1fr)" width="100%">
      <GridItem bg="yellow" colSpan={5}>
        {header ? <GridItem colSpan={1}>{header}</GridItem> : <></>}
        <GridItem colSpan={1}>
          <PageBody>{body}</PageBody>
        </GridItem>
      </GridItem>
    </Grid>
  );
}
