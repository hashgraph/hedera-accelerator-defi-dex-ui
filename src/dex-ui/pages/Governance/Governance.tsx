import { useLocation, useNavigate } from "react-router-dom";
import { Text, Button, Flex, Spacer, VStack } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { useDexContext } from "../../hooks";
import { useGovernanceData } from "../../hooks/useGovernanceData";
import { useState } from "react";
import { Notification, NotficationTypes } from "../../../dex-ui-components";
import { CreateProposalLocationProps } from "../CreateProposal";
import { createHashScanLink } from "../../utils";

export const Governance = (): JSX.Element => {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  useGovernanceData();
  const navigate = useNavigate();
  const locationState = useLocation().state as CreateProposalLocationProps;
  const [shouldShowNotification, setShouldShowNotification] = useState<boolean>(
    locationState?.isProposalCreationSuccessful ?? false
  );

  return (
    <Flex flexDirection="column" width="100%">
      {shouldShowNotification ? (
        <>
          <Notification
            type={NotficationTypes.SUCCESS}
            message={`You have created ${locationState.proposalTitle}`}
            isLinkShown={true}
            linkText="View in HashScan"
            linkRef={createHashScanLink(locationState.proposalTransactionId)}
            isCloseButtonShown={true}
            handleClickClose={() => setShouldShowNotification(false)}
          />
          <Spacer margin="0.25rem 0rem" />
        </>
      ) : (
        <></>
      )}
      <Text textStyle="h2">Governance</Text>
      <Spacer margin="1rem" />
      <Flex direction="row" alignItems="center">
        <Text textStyle="h3">Active Proposals</Text>
        <Spacer />
        <Button
          variant="new-proposal"
          textStyle="b2-bold"
          data-testid="new-proposal-button"
          onClick={() => navigate("/governance/select-proposal-type")}
        >
          New Proposal
        </Button>
      </Flex>
      <Spacer margin="0.5rem" />
      <VStack>
        {governance.proposals
          .filter((proposal) => proposal.status === "Active")
          .map((proposal, index) => (
            <ProposalCard proposal={proposal} key={index} />
          ))}
      </VStack>
      <Spacer margin="1rem" />

      <Text textStyle="h3">All Proposals</Text>

      <Spacer margin="0.5rem" />
      <VStack>
        {governance.proposals
          .filter((proposal) => proposal.status === "Passed" || proposal.status === "Failed")
          .map((proposal, index) => (
            <ProposalCard proposal={proposal} key={index} />
          ))}
      </VStack>
    </Flex>
  );
};
