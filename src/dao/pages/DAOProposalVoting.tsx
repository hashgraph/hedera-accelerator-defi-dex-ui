import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { Text, Color, ProgressBar, PeopleIcon, useTheme } from "@shared/ui-kit";
import { Proposal } from "@dao/hooks";
import { DAO, DAOType } from "@dao/services";

interface DAOProposalVotingProps {
  proposal: Proposal;
  dao: DAO;
}

export function DAOProposalVoting(props: DAOProposalVotingProps) {
  const { proposal, dao } = props;
  const theme = useTheme();
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
          backgroundColor={theme.bgSecondary}
          border={`1px solid ${theme.border}`}
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
            progressBarColor={Color.Success._500}
          />
          <PeopleIcon boxSize={{ base: 4, md: 5 }} color={theme.text} />
          <Text.P_Medium_Regular fontSize={{ base: "xs", md: "sm" }} color={theme.text}>
            {proposal.approvalCount} / {dao.threshold}
          </Text.P_Medium_Regular>
        </Flex>
      ) : (
        <Flex direction="row" gap={2} alignItems="center">
          <Flex
            direction="column"
            padding={{ base: 2, md: 3 }}
            backgroundColor={theme.bgSecondary}
            border={`1px solid ${theme.border}`}
            borderRadius="8px"
          >
            <Text.P_XSmall_Regular color={theme.textMuted} textAlign="start" fontSize={{ base: "10px", md: "xs" }}>
              Voting end time
            </Text.P_XSmall_Regular>
            <Text.P_XSmall_Semibold
              color={theme.text}
              textAlign="start"
              whiteSpace="nowrap"
              fontSize={{ base: "10px", md: "xs" }}
            >
              {votingEndTime}
            </Text.P_XSmall_Semibold>
          </Flex>
          <Flex
            border={`1px solid ${Color.Success._500}`}
            paddingX={{ base: 2, md: 3 }}
            paddingY={{ base: 1, md: 2 }}
            borderRadius={4}
            alignItems="center"
          >
            <Text.P_Small_Medium color={Color.Success._500} whiteSpace="nowrap" fontSize={{ base: "10px", md: "sm" }}>
              Turnout: {`${turnout}%`}
            </Text.P_Small_Medium>
          </Flex>
        </Flex>
      )}
    </>
  );
}
