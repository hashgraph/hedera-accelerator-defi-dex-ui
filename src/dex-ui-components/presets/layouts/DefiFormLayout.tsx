import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
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
  const gridGap = "1.25rem";
  return (
    <Grid
      data-testid="defi-form-component" // use dynamic id here from props
      layerStyle="defi-form"
    >
      <GridItem marginBottom={gridGap} colSpan={1}>
        {props.title}
      </GridItem>
      <GridItem colSpan={1}>
        <Flex justifyContent="end">{props.settingsButton}</Flex>
      </GridItem>
      <GridItem marginBottom={props.isSettingsOpen ? gridGap : 0} colSpan={2}>
        {props.settingsInputs}
      </GridItem>
      <GridItem marginBottom={props.notification ? gridGap : 0} colSpan={2}>
        {props.notification}
      </GridItem>
      <GridItem marginBottom={gridGap} colSpan={2}>
        <Flex direction="column" alignItems="stretch" gap="1">
          {props.formInputs?.map((input: React.ReactNode, index: number) => (
            <Box key={index}>{input}</Box>
          ))}
        </Flex>
      </GridItem>
      <GridItem marginBottom={gridGap} colSpan={2}>
        <Grid templateColumns="repeat(3, 1fr)" gap="4">
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
