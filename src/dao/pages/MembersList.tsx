import { Flex, SimpleGrid } from "@chakra-ui/react";
import { Text, Color, HashScanLink, HashscanData, Tag } from "@shared/ui-kit";
import * as R from "ramda";
import { MultiSigDAODetailsContext } from "./MultiSigDAODashboard/types";
import { useOutletContext } from "react-router-dom";
import { Member } from "@dao/services";

export function MembersList() {
  const { dao, members } = useOutletContext<MultiSigDAODetailsContext>();
  const { adminId } = dao;

  const adminIndex = members?.findIndex((member) => member.accountId === adminId);
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const membersWithAdminFirst: Member[] = R.swap(0, adminIndex, members);

  return (
    <>
      <Flex layerStyle="dao-dashboard__content-header">
        <Text.P_Medium_Medium>{members.length} Members</Text.P_Medium_Medium>
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
                bg={Color.White_02}
                justifyContent="space-between"
                border={`1px solid ${Color.Neutral._200}`}
                borderRadius="4px"
                padding="1.5rem"
              >
                <Flex direction="row" justifyContent="space-between" gap="4">
                  <HashScanLink id={accountId} type={HashscanData.Account} />
                  {isAdmin ? <Tag label="Admin" /> : <></>}
                </Flex>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Flex>
    </>
  );
}
