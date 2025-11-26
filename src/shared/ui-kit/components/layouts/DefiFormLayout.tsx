import { Box, Flex, Grid, GridItem, useBreakpointValue } from "@chakra-ui/react";
import { isEmpty } from "ramda";

interface DefiFormLayoutProps {
  title: React.ReactNode;
  settingsButton: React.ReactNode;
  settingsInputs: React.ReactNode;
  isSettingsOpen: boolean;
  notification?: React.ReactNode;
  formInputs: React.ReactNode[];
  metrics: React.ReactNode[];
  actionButtonNotifications?: React.ReactNode[];
  actionButtons: React.ReactNode;
}

export function DefiFormLayout(props: DefiFormLayoutProps) {
  const gridGap = useBreakpointValue({ base: "1rem", md: "1.25rem" }) || "1.25rem";
  const metricsColumns = useBreakpointValue({ base: 1, sm: 3 });
  const titleColSpan = useBreakpointValue({ base: 2, sm: 1 });

  return (
    <Grid data-testid="defi-form-component" layerStyle="defi-form" width="100%">
      <GridItem marginBottom={gridGap} colSpan={titleColSpan}>
        {props.title}
      </GridItem>
      <GridItem colSpan={titleColSpan} display={{ base: "none", sm: "block" }}>
        <Flex justifyContent="end">{props.settingsButton}</Flex>
      </GridItem>
      {/* Mobile settings button */}
      <GridItem colSpan={2} display={{ base: "block", sm: "none" }} mb={2}>
        <Flex justifyContent="flex-start">{props.settingsButton}</Flex>
      </GridItem>
      <GridItem marginBottom={props.isSettingsOpen ? gridGap : 0} colSpan={2}>
        {props.settingsInputs}
      </GridItem>
      <GridItem marginBottom={props.notification ? gridGap : 0} colSpan={2}>
        {props.notification}
      </GridItem>
      <GridItem marginBottom={gridGap} colSpan={2}>
        <Flex direction="column" alignItems="stretch" gap={{ base: "2", md: "1" }}>
          {props.formInputs?.map((input: React.ReactNode, index: number) => (
            <Box key={index}>{input}</Box>
          ))}
        </Flex>
      </GridItem>
      <GridItem marginBottom={gridGap} colSpan={2}>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={{ base: "3", md: "4" }}>
          {props.metrics?.map((metric: React.ReactNode, index: number) => (
            <GridItem colSpan={1} key={index}>
              {metric}
            </GridItem>
          ))}
        </Grid>
      </GridItem>
      <GridItem marginBottom={isEmpty(props.actionButtonNotifications) ? 0 : gridGap} colSpan={2}>
        <Flex direction="column" alignItems="stretch" gap="2">
          {props.actionButtonNotifications?.map((notification: React.ReactNode, index: number) => (
            <Box key={index}>{notification}</Box>
          ))}
        </Flex>
      </GridItem>
      <GridItem colSpan={2}>
        <Flex direction="column" alignItems="stretch">
          {props.actionButtons}
        </Flex>
      </GridItem>
    </Grid>
  );
}
