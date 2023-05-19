import { Text, Grid, Flex, GridItem } from "@chakra-ui/react";
import { BreadcrumbText, Color } from "@dex-ui-components";
import { ReactElement } from "react";

export interface ProposalDetailsLayoutProps {
  title: string;
  author?: string;
  statusStepper: ReactElement;
  rightNavigation: ReactElement;
  details: ReactElement;
  rightPanel: ReactElement;
}

export function ProposalDetailsLayout(props: ProposalDetailsLayoutProps) {
  const { title, statusStepper, rightNavigation, details, rightPanel } = props;

  return (
    <Grid
      templateColumns="repeat(4, 1fr)"
      gap="4"
      width="100%"
      height="100%"
      paddingTop="1.5rem"
      paddingLeft="5rem"
      paddingRight="5rem"
    >
      <GridItem colSpan={3}>
        <Flex direction="column" gap="8">
          <Flex direction="row" justifyContent="space-between">
            <BreadcrumbText />
            {rightNavigation}
          </Flex>
          <Flex direction="column" gap="2">
            <Text textStyle="h3 medium">{title}</Text>
            {/**TODO: Determine how to get transaction author */}
            {/* <Flex direction="row" alignItems="center" gap="2">
              <Text textStyle="p small medium" color={Color.Neutral._500}>
                Author By
              </Text>
              <HashScanLink id={author} type={HashscanData.Account} />
            </Flex> */}
          </Flex>
          <Flex layerStyle="content-box">{statusStepper}</Flex>
          <Flex direction="column" gap="2">
            <Text textStyle="p medium medium" color={Color.Grey_Blue._800}>
              Details
            </Text>
            <Flex layerStyle="content-box">{details}</Flex>
          </Flex>
        </Flex>
      </GridItem>
      <GridItem colSpan={1}>
        <Flex layerStyle="content-box" direction="column" height="100%">
          {rightPanel}
        </Flex>
      </GridItem>
    </Grid>
  );
}
