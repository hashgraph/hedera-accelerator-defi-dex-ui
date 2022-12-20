import { useLocation, useNavigate } from "react-router-dom";
import { Text, Button, Flex, Grid, GridItem, Circle, Box, Skeleton } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { useDexContext } from "../../hooks";
import { useGovernanceData } from "../../hooks/useGovernanceData";
import { useState } from "react";
import { Notification, NotficationTypes } from "../../../dex-ui-components";
import { CreateProposalLocationProps } from "../CreateProposal";
import { createHashScanLink } from "../../utils";
import { formatProposal } from "./formatter";
import { FormattedProposal } from "./types";

const VOTING_KEYS: { value: string; color: string }[] = [
  { value: "Yes", color: "#79B54B" },
  { value: "No", color: "#EE2B00" },
  { value: "Abstain", color: "#000AFF" },
  { value: "Remain", color: "#DBDEDF" },
];

export const Governance = (): JSX.Element => {
  const { app, governance } = useDexContext(({ app, governance }) => ({ app, governance }));
  const formattedProposals = governance.proposals.map(formatProposal);
  useGovernanceData();
  const navigate = useNavigate();

  const locationState = useLocation().state as CreateProposalLocationProps;
  const [shouldShowNotification, setShouldShowNotification] = useState<boolean>(
    locationState?.isProposalCreationSuccessful ?? false
  );

  return (
    <Grid templateColumns="repeat(1, 1fr)" gap={8} minHeight="500px" width="100%">
      {shouldShowNotification ? (
        <Notification
          type={NotficationTypes.SUCCESS}
          message={`You have created ${locationState.proposalTitle}`}
          isLinkShown={true}
          linkText="View in HashScan"
          linkRef={createHashScanLink(locationState.proposalTransactionId)}
          isCloseButtonShown={true}
          handleClickClose={() => setShouldShowNotification(false)}
        />
      ) : (
        <></>
      )}
      <GridItem colSpan={1}>
        <Flex direction="row">
          <Text flex="4" textStyle="h1">
            Governance
          </Text>
          <Button
            flex="1"
            alignSelf="center"
            variant="new-proposal"
            textStyle="h3"
            data-testid="new-proposal-button"
            onClick={() => navigate("/governance/select-proposal-type")}
          >
            New Proposal
          </Button>
        </Flex>
      </GridItem>
      <GridItem colSpan={1}>
        <Flex direction="row" alignItems="center">
          <Text flex="4" textStyle="h3">
            All Proposals
          </Text>
          <Box>
            <Flex direction="row" gap="4">
              {VOTING_KEYS.map((metric, index) => (
                <Flex flex="1" key={index} gap="1">
                  <Circle size="1em" bg={metric.color} />
                  <Text textStyle="h4">{metric.value}</Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Flex>
      </GridItem>

      <Flex direction="column" gap="2" minHeight="500px">
        {app.isFeatureLoading("proposals") ? (
          <>
            <Skeleton height="92px" speed={0.4} fadeDuration={0} />
            <Skeleton height="92px" speed={0.4} fadeDuration={0} />
            <Skeleton height="92px" speed={0.4} fadeDuration={0} />
            <Skeleton height="92px" speed={0.4} fadeDuration={0} />
            <Skeleton height="92px" speed={0.4} fadeDuration={0} />
          </>
        ) : (
          formattedProposals.map((proposal: FormattedProposal, index: number) => (
            <ProposalCard proposal={proposal} key={index} />
          ))
        )}
      </Flex>
    </Grid>
  );
};
