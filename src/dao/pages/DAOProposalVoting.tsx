import { Flex } from "@chakra-ui/react";
import { Text, Color, ProgressBar, PeopleIcon } from "@shared/ui-kit";
import { Proposal } from "@dao/hooks";
import { DAO, DAOType } from "@dao/services";

interface DAOProposalVotingProps {
  proposal: Proposal;
  dao: DAO;
}

export function DAOProposalVoting(props: DAOProposalVotingProps) {
  const { proposal, dao } = props;
  const isMultiSig = dao.type === DAOType.MultiSig;
  let turnout = proposal.votes?.turnout ?? 0;
  if (isMultiSig && dao.threshold) {
    turnout = Math.round((proposal.approvalCount / dao.threshold) * 100);
  }
  const votingEndTime = new Date(Number(proposal.votingEndTime) * 1000).toLocaleString();

  return (
    <>
      {isMultiSig ? (
        <Flex
          direction="row"
          gap={2}
          padding={3}
          backgroundColor={Color.Grey_Blue._50}
          width="256px"
          alignItems="center"
        >
          <ProgressBar
            height="8px"
            flex="1"
            borderRadius="4px"
            value={turnout}
            progressBarColor={Color.Grey_Blue._300}
          />
          <PeopleIcon boxSize={5} />
          <Text.P_Medium_Regular>
            {proposal.approvalCount} / {dao.threshold}
          </Text.P_Medium_Regular>
        </Flex>
      ) : (
        <Flex direction="column" gap={2} padding={3} backgroundColor={Color.Grey_Blue._50} width="256px">
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Flex gap={2} alignItems="flex-start">
              <Flex direction="column" alignItems="flex-start">
                <Text.P_XSmall_Regular color={Color.Grey_Blue._600} textAlign="start">
                  Voting end time
                </Text.P_XSmall_Regular>
                <Text.P_XSmall_Semibold color={Color.Grey_Blue._600} textAlign="start" whiteSpace="nowrap">
                  {votingEndTime}
                </Text.P_XSmall_Semibold>
              </Flex>
              <Flex border={`1px solid ${Color.Success._600}`} paddingX={3} borderRadius={4} textAlign="center">
                <Text.P_Small_Medium
                  color={Color.Success._600}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  Turnout: {`${turnout}%`}
                </Text.P_Small_Medium>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
}
