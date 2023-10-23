import { Button, Divider, Flex, SimpleGrid, IconButton, Image, Link, UnorderedList, ListItem } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Text, RefreshIcon, Color, Tag, CopyTextButton, DefaultLogoIcon, ExternalLink } from "@shared/ui-kit";
import * as R from "ramda";
import { MultiSigDAODetailsContext } from "./types";
import { Member } from "@dao/services";
import { DAOFormContainer } from "../CreateADAO/forms/DAOFormContainer";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { getDAOLinksRecordArray } from "../utils";
import { Link as ReachLink } from "react-router-dom";
import { usePairedWalletDetails } from "@dex/hooks";
import { Routes } from "@dao/routes/routes";
import { RemoveMemberLocationState, ReplaceMemberLocationState } from "../DAOProposals";

const { Multisig, DAOAddMemberDetails, DAODeleteMemberDetails, DAOReplaceMemberDetails, DAOUpgradeThresholdDetails } =
  Routes;

export function Settings() {
  const { accountId: daoAccountId = "" } = useParams();
  const navigate = useNavigate();
  const { dao, members } = useOutletContext<MultiSigDAODetailsContext>();
  const { name, logoUrl, description, webLinks, adminId, threshold, infoUrl } = dao;
  const adminIndex = members?.findIndex((member) => member.accountId === adminId);
  const { isWalletPaired, walletId } = usePairedWalletDetails();
  const isAdmin = isWalletPaired && walletId === dao.adminId;
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const membersWithAdminFirst: Member[] = R.swap(0, adminIndex, members);
  const daoLinkRecords = getDAOLinksRecordArray(webLinks);

  function handleCopyMemberId() {
    console.log("copy text to clipboard");
  }

  function handleAddNewMemberClicked() {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAOAddMemberDetails}`);
  }

  function handleDeleteMemberClick(memberId: string) {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAODeleteMemberDetails}`, {
      state: { memberId },
    } as RemoveMemberLocationState);
  }

  function handleReplaceMemberClick(memberId: string) {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAOReplaceMemberDetails}`, {
      state: { memberId },
    } as ReplaceMemberLocationState);
  }

  function handleChangeThresholdClick() {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAOUpgradeThresholdDetails}`);
  }

  function handleChangeDAODetailsClick() {
    navigate(Routes.ChangeDAOSettings);
  }

  return (
    <form id="dao-settings-submit">
      <Flex direction="column" alignItems="center" maxWidth="841px" margin="auto" gap="4" padding="1rem 0">
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text.P_Medium_Medium>Members</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the member preferences, add, remove or rename them.
            </Text.P_Small_Regular>
            <Divider />
          </Flex>
          <Flex direction="row" alignItems="center" marginBottom="0.4rem" justifyContent="space-between">
            <Text.P_Small_Regular>{members.length} Members</Text.P_Small_Regular>
            <Button type="button" variant="primary" onClick={handleAddNewMemberClicked}>
              + Add Member
            </Button>
          </Flex>
          <SimpleGrid minWidth="100%" columns={1} spacingX="2rem" spacingY="1.2rem">
            {membersWithAdminFirst?.map((member, index) => {
              const { accountId } = member;
              const isAdminTag = accountId === adminId;
              return (
                <Flex
                  key={index}
                  direction="row"
                  bg={Color.White_02}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Flex direction="row" gap="2" alignItems="center">
                    <Text.P_Small_Regular color={Color.Neutral._500}>{accountId}</Text.P_Small_Regular>
                    <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
                    {isAdminTag ? <Tag label="Admin" /> : <></>}
                  </Flex>
                  <Flex direction="row" gap="4" alignItems="center" height="20px">
                    {!isAdminTag ? (
                      <IconButton
                        size="xs"
                        variant="link"
                        aria-label="refresh-member"
                        onClick={() => handleReplaceMemberClick(member.accountId)}
                        icon={<RefreshIcon boxSize="17" color={Color.Teal_01} />}
                      />
                    ) : undefined}
                    {!isAdminTag ? (
                      <IconButton
                        size="xs"
                        onClick={() => handleDeleteMemberClick(member.accountId)}
                        variant="link"
                        aria-label="delete-member-id"
                        icon={<DeleteIcon color={Color.Teal_01} boxSize="17" />}
                      />
                    ) : undefined}
                  </Flex>
                </Flex>
              );
            })}
          </SimpleGrid>
        </DAOFormContainer>
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text.P_Medium_Medium>Governance</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the governance related DAO properties.
            </Text.P_Small_Regular>
            <Divider />
          </Flex>
          <SimpleGrid minWidth="100%" columns={2} spacingX="2rem" spacingY="1.2rem">
            <Flex
              direction="column"
              bg={Color.White_02}
              justifyContent="space-between"
              border={`1px solid ${Color.Neutral._200}`}
              borderRadius="4px"
              padding="1.5rem"
            >
              <Flex direction="row" justifyContent="space-between" alignItems="center">
                <Flex direction="column" gap="1">
                  <Text.P_XSmall_Medium color={Color.Neutral._500}>THRESHOLD</Text.P_XSmall_Medium>
                  <Text.P_Large_Medium>{`${threshold ?? 0} / ${members.length}`}</Text.P_Large_Medium>
                </Flex>
                <Button
                  type="button"
                  variant="primary"
                  padding="10px 10px"
                  height="40px"
                  onClick={handleChangeThresholdClick}
                >
                  Change
                </Button>
              </Flex>
            </Flex>
          </SimpleGrid>
        </DAOFormContainer>
        <DAOFormContainer rest={{ gap: 6 }}>
          <Flex direction="column" gap={2}>
            <Text.P_Medium_Medium>General</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the general DAO properties.
            </Text.P_Small_Regular>
            <Divider />
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Name</Text.P_Small_Medium>
            <Text.P_Small_Regular color={Color.Neutral._700}>{name}</Text.P_Small_Regular>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Logo URL</Text.P_Small_Medium>
            <Flex direction="row" gap="2" alignItems="center">
              <Image
                src={logoUrl}
                boxSize="4rem"
                objectFit="contain"
                alt="Logo Url"
                fallback={<DefaultLogoIcon boxSize="4rem" color={Color.Grey_Blue._100} />}
              />
              <Link
                as={ReachLink}
                textStyle="p small regular link"
                color={Color.Primary._500}
                to={logoUrl}
                isExternal
                maxWidth="90%"
              >
                {logoUrl}
              </Link>
            </Flex>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Description</Text.P_Small_Medium>
            <Text.P_Small_Regular color={Color.Neutral._700}>{description}</Text.P_Small_Regular>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>INFO URL</Text.P_Small_Medium>
            <ExternalLink to={infoUrl ?? ""}>
              <Text.P_Small_Semibold_Link>{infoUrl}</Text.P_Small_Semibold_Link>
            </ExternalLink>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Social Channels</Text.P_Small_Medium>
            <Flex direction="column" gap={2} justifyContent="space-between">
              <UnorderedList>
                {daoLinkRecords.map((link, index) => {
                  return (
                    <ListItem key={index}>
                      <Link
                        key={index}
                        as={ReachLink}
                        textStyle="p small regular link"
                        color={Color.Primary._500}
                        to={link.value}
                        isExternal
                      >
                        {link.value}
                      </Link>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            </Flex>
          </Flex>
          {isAdmin ? (
            <Flex alignItems="flex-end" gap="1rem" direction="column">
              <Divider />
              <Button
                type="button"
                variant="primary"
                padding="10px 15px"
                height="40px"
                onClick={handleChangeDAODetailsClick}
              >
                Change
              </Button>
            </Flex>
          ) : undefined}
        </DAOFormContainer>
      </Flex>
    </form>
  );
}
