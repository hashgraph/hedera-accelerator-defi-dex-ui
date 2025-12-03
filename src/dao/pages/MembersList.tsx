import { Flex, SimpleGrid } from "@chakra-ui/react";
import { Text, HashScanLink, HashscanData, Tag, useTheme } from "@shared/ui-kit";
import * as R from "ramda";
import { MultiSigDAODetailsContext } from "./MultiSigDAODashboard/types";
import { GovernanceDAODetailsContext } from "./GovernanceDAODashboard/types";
import { NFTDAODetailsContext } from "./NFTDAODashboard/types";
import { useOutletContext } from "react-router-dom";
import { Member } from "@dao/services";

type DAODetailsContext = MultiSigDAODetailsContext | GovernanceDAODetailsContext | NFTDAODetailsContext;

export function MembersList() {
  const theme = useTheme();
  const context = useOutletContext<DAODetailsContext>();
  const { dao, members } = context;
  const { adminId } = dao;

  const adminIndex = members?.findIndex((member) => member.accountId === adminId);
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const membersWithAdminFirst: Member[] = R.swap(0, adminIndex, members);

  return (
    <>
      <Flex
        layerStyle="dao-dashboard__content-header"
        bg={theme.bgSecondary}
        borderBottom={`1px solid ${theme.border}`}
      >
        <Text.P_Medium_Medium color={theme.text}>{members.length} Members</Text.P_Medium_Medium>
      </Flex>
      <Flex direction="row" layerStyle="dao-dashboard__content-body">
        <SimpleGrid minWidth="100%" columns={3} spacing="1rem">
          {membersWithAdminFirst?.map((member, index) => {
            const { accountId } = member;
            const isAdmin = accountId === adminId;
            return (
              <Flex
                key={index}
                direction="column"
                bg={theme.bgSecondary}
                justifyContent="space-between"
                border={`1px solid ${theme.border}`}
                borderRadius="4px"
                padding="1.5rem"
              >
                <Flex direction="row" justifyContent="space-between" gap="4">
                  <HashScanLink id={accountId} type={HashscanData.Account} />
                  {isAdmin && (
                    <Flex direction="row" gap="2">
                      <Tag label="Admin" />
                    </Flex>
                  )}
                </Flex>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Flex>
    </>
  );
}
