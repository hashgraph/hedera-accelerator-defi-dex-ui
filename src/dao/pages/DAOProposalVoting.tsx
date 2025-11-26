import { Flex, useBreakpointValue } from "@chakra-ui/react";
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

  // Responsive widths
  const votingWidth = useBreakpointValue({ base: "100%", sm: "200px", md: "256px" });

  return (
    <>
      {isMultiSig ? (
        <Flex
          direction="row"
          gap={2}
          padding={{ base: 2, md: 3 }}
          backgroundColor={Color.Grey_Blue._50}
          width={votingWidth}
          minWidth={{ base: "140px", md: "180px" }}
          alignItems="center"
          borderRadius="8px"
        >
          <ProgressBar
            height={{ base: "6px", md: "8px" }}
            flex="1"
            borderRadius="4px"
            value={turnout}
            progressBarColor={Color.Grey_Blue._300}
          />
          <PeopleIcon boxSize={{ base: 4, md: 5 }} />
          <Text.P_Medium_Regular fontSize={{ base: "xs", md: "sm" }}>
            {proposal.approvalCount} / {dao.threshold}
          </Text.P_Medium_Regular>
        </Flex>
      ) : (
        <Flex
          direction="column"
          gap={2}
          padding={{ base: 2, md: 3 }}
          backgroundColor={Color.Grey_Blue._50}
          width={votingWidth}
          minWidth={{ base: "160px", md: "200px" }}
          borderRadius="8px"
        >
          <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
            <Flex gap={{ base: 1, md: 2 }} alignItems="flex-start" direction={{ base: "column", sm: "row" }}>
              <Flex direction="column" alignItems="flex-start">
                <Text.P_XSmall_Regular
                  color={Color.Grey_Blue._600}
                  textAlign="start"
                  fontSize={{ base: "10px", md: "xs" }}
                >
                  Voting end time
                </Text.P_XSmall_Regular>
                <Text.P_XSmall_Semibold
                  color={Color.Grey_Blue._600}
                  textAlign="start"
                  whiteSpace={{ base: "normal", md: "nowrap" }}
                  fontSize={{ base: "10px", md: "xs" }}
                >
                  {votingEndTime}
                </Text.P_XSmall_Semibold>
              </Flex>
              <Flex
                border={`1px solid ${Color.Success._600}`}
                paddingX={{ base: 2, md: 3 }}
                paddingY={{ base: 0.5, md: 0 }}
                borderRadius={4}
                textAlign="center"
              >
                <Text.P_Small_Medium
                  color={Color.Success._600}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  fontSize={{ base: "10px", md: "sm" }}
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
