import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Link,
  Card,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Grid,
  GridItem,
  Text,
  Box,
  Spacer,
} from "@chakra-ui/react";
import { Link as ReachLink, useLocation } from "react-router-dom";
import { HorizontalStackBarChart, Metrics } from "../../../dex-ui-components";
import { useDexContext } from "../../hooks";
import { Proposal } from "../../store/governanceSlice";
import { formatProposal } from "../Governance/formatter";
import { FormattedProposal } from "../Governance/types";

// interface ProposalDetailsProps {

// }

export const ProposalDetails = () => {
  const locationState = useLocation();
  const state = locationState.state as FormattedProposal;
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  // const formattedProposals = formatProposal(governance.proposals);

  return (
    <>
      <Grid templateColumns="repeat(4, 1fr)" gap="4" minHeight="500px">
        <GridItem colSpan={3}>
          <Flex direction="column" gap={10} height="100%">
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReachLink} to="/governance">
                  <Text textStyle="link">{"< Governance"}</Text>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <Box>
              <Text textStyle="h2">{state.title}</Text>
              <Flex flexWrap="wrap" width="100%">
                <Text alignSelf="center" textStyle="b2">
                  Authored by &nbsp;
                </Text>
                <Link
                  width="fit-content"
                  display="flex"
                  alignItems="center"
                  color="#0180FF"
                  // href={linkRef}
                  isExternal
                >
                  <Text textDecoration="underline">{state.author}</Text>
                  <ExternalLinkIcon margin="0rem 0.125rem" />
                </Link>
              </Flex>
            </Box>
            <Box flexGrow="1">
              <Text textStyle="h3">Description</Text>
              <Spacer padding="0.25rem" />
              <Text textStyle="b2">{state.description}</Text>
            </Box>
            <Flex gap="4" direction="column">
              <Text textStyle="h3">Vote on Proposal</Text>
              <Flex gap="4">
                <Button flex="1">Vote Yes</Button>
                <Button flex="1">Vote No</Button>
                <Button flex="1">Abstain</Button>
              </Flex>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction="column" gap="2">
            <Button variant="secondary">View Discussion</Button>
            <Card>
              <Text textStyle="h3">Status</Text>
              <Text>{state.state}</Text>
              <Text>{state.timeRemaining}</Text>
            </Card>
            <Card>
              <Text textStyle="h3">Votes</Text>
              <HorizontalStackBarChart
                data={[
                  { value: state.voteCount.yes ?? 0, bg: "#79B54B" },
                  { value: state.voteCount.no ?? 0, bg: "#EE2B00" },
                  { value: state.voteCount.abstain ?? 0, bg: "#000AFF" },
                  /** TODO: Determine how to abtain total possible votes */
                  { value: state.voteCount.abstain ?? 0, bg: "#DBDEDF" },
                ]}
              />
              <Metrics
                data={[
                  { value: state.voteCount.yes ?? 0, color: "#79B54B" },
                  { value: state.voteCount.no ?? 0, color: "#EE2B00" },
                  { value: state.voteCount.abstain ?? 0, color: "#000AFF" },
                  /** TODO: Determine how to abtain total possible votes */
                  { value: state.voteCount.abstain ?? 0, color: "#DBDEDF" },
                ]}
              />
            </Card>
          </Flex>
        </GridItem>
      </Grid>
    </>
  );
};
