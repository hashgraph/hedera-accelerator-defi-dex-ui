import { useLocation, useNavigate } from "react-router-dom";
import { Text, Button, Flex, Spacer, Grid, GridItem, Circle, HStack, Box } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { useDexContext } from "../../hooks";
import { useGovernanceData } from "../../hooks/useGovernanceData";
import { useState } from "react";
import { Notification, NotficationTypes } from "../../../dex-ui-components";
import { CreateProposalLocationProps } from "../CreateProposal";
import { createHashScanLink } from "../../utils";
import { formatProposal } from "./formatter";
import { ProposalStatus } from "../../store/governanceSlice";

const data = [
  { value: "Yes", color: "#79B54B" },
  { value: "No", color: "#EE2B00" },
  { value: "Abstain", color: "#000AFF" },
  /** TODO: Determine how to abtain total possible votes */
  { value: "Remain", color: "#DBDEDF" },
];

export const Governance = (): JSX.Element => {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  const formattedProposals = governance.proposals.map(formatProposal);
  useGovernanceData();
  const navigate = useNavigate();

  const locationState = useLocation().state as CreateProposalLocationProps;
  const [shouldShowNotification, setShouldShowNotification] = useState<boolean>(
    locationState?.isProposalCreationSuccessful ?? false
  );

  return (
    <Grid templateColumns="repeat(1, 1fr)" gap={8} minHeight="500px">
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
              {data.map((metric, index) => (
                <Flex flex="1" key={index} gap="1">
                  <Circle size="1em" bg={metric.color} />
                  <Text textStyle="h4">{metric.value}</Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Flex>
      </GridItem>
      <Flex direction="column">
        {formattedProposals
          .filter((proposal) => proposal.status === ProposalStatus.Passed || proposal.status === ProposalStatus.Failed)
          .map((proposal, index) => (
            <>
              <ProposalCard proposal={proposal} key={index} />
              <Spacer margin="0.3rem" />
            </>
          ))}
      </Flex>
    </Grid>
  );
};
