import {
  Button,
  Divider,
  Flex,
  SimpleGrid,
  Text,
  IconButton,
  Image,
  Link,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { RefreshIcon, Color, Tag, CopyTextButton, DefaultLogoIcon } from "@dex-ui-components";
import * as R from "ramda";
import { MultiSigDAODetailsContext } from "./types";
import { Member } from "@services";
import { DAOFormContainer } from "../CreateADAO/forms/DAOFormContainer";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getDAOLinksRecordArray } from "../utils";
import { Link as ReachLink } from "react-router-dom";
import { useDexContext } from "@hooks";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { Paths } from "@routes";
import { RemoveMemberLocationState, ReplaceMemberLocationState } from "@pages";

const {
  absolute: AbsolutePath,
  Multisig,
  DAOAddMemberDetails,
  DAODeleteMemberDetails,
  DAOReplaceMemberDetails,
  DAOUpgradeThresholdDetails,
} = Paths.DAOs;

export function Settings() {
  const navigate = useNavigate();
  const { dao, members } = useOutletContext<MultiSigDAODetailsContext>();
  const { name, logoUrl, description, webLinks, adminId, threshold, accountId: daoAccountId } = dao;
  const adminIndex = members?.findIndex((member) => member.accountId === adminId);
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const isAdminWalletPaired =
    walletId === adminId && wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const membersWithAdminFirst: Member[] = R.swap(0, adminIndex, members);
  const daoLinkRecords = getDAOLinksRecordArray(webLinks);

  function handleCopyMemberId() {
    console.log("copy text to clipboard");
  }

  function handleAddNewMemberClicked() {
    navigate(`${AbsolutePath}/${Multisig}/${daoAccountId}/new-proposal/${DAOAddMemberDetails}`);
  }

  function handleDeleteMemberClick(memberId: string) {
    navigate(`${AbsolutePath}/${Multisig}/${daoAccountId}/new-proposal/${DAODeleteMemberDetails}`, {
      state: { memberId },
    } as RemoveMemberLocationState);
  }

  function handleReplaceMemberClick(memberId: string) {
    navigate(`${AbsolutePath}/${Multisig}/${daoAccountId}/new-proposal/${DAOReplaceMemberDetails}`, {
      state: { memberId },
    } as ReplaceMemberLocationState);
  }

  function handleChangeThresholdClick() {
    navigate(`${AbsolutePath}/${Multisig}/${daoAccountId}/new-proposal/${DAOUpgradeThresholdDetails}`);
  }

  function handleChangeDAODetailsClick() {
    navigate(Paths.DAOs.ChangeDAOSettings);
  }

  return (
    <form id="dao-settings-submit">
      <Flex direction="column" alignItems="center" maxWidth="841px" margin="auto" gap="4" padding="1rem 0">
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text textStyle="p medium medium">Members</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the member preferences, add, remove or rename them.
            </Text>
            <Divider />
          </Flex>
          <Flex direction="row" alignItems="center" marginBottom="0.4rem" justifyContent="space-between">
            <Text textStyle="p small regular">{members.length} Members</Text>
            <Button type="button" variant="primary" onClick={handleAddNewMemberClicked}>
              + Add Member
            </Button>
          </Flex>
          <SimpleGrid minWidth="100%" columns={1} spacingX="2rem" spacingY="1.2rem">
            {membersWithAdminFirst?.map((member) => {
              const { accountId } = member;
              const isAdmin = accountId === adminId;
              return (
                <Flex direction="row" bg={Color.White_02} justifyContent="space-between" alignItems="center">
                  <Flex direction="row" gap="2" alignItems="center">
                    <Text textStyle="p small regular" color={Color.Neutral._500}>
                      {accountId}
                    </Text>
                    <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
                    {isAdmin ? <Tag label="Admin" /> : <></>}
                  </Flex>
                  <Flex direction="row" gap="4" alignItems="center" height="20px">
                    {!isAdmin ? (
                      <IconButton
                        size="xs"
                        variant="link"
                        aria-label="refresh-member"
                        onClick={() => handleReplaceMemberClick(member.accountId)}
                        icon={<RefreshIcon boxSize="17" color={Color.Teal_01} />}
                      />
                    ) : undefined}
                    {!isAdmin ? (
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
            <Text textStyle="p medium medium">Governance</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the governance related DAO properties.
            </Text>
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
                  <Text textStyle="p xsmall medium" color={Color.Neutral._500}>
                    THRESHOLD
                  </Text>
                  <Text textStyle="p large medium">{`${threshold ?? 0} / ${members.length}`}</Text>
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
            <Text textStyle="p medium medium">General</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the general DAO properties.
            </Text>
            <Divider />
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Name</Text>
            <Text textStyle="p small regular" color={Color.Neutral._700}>
              {name}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Logo URL</Text>
            <Flex direction="row" gap="2" alignItems="center">
              <Image
                src={logoUrl}
                boxSize="4rem"
                objectFit="contain"
                alt="Logo Url"
                fallback={<DefaultLogoIcon boxSize="4rem" color={Color.Grey_Blue._100} />}
              />
              <Link as={ReachLink} textStyle="p small regular link" color={Color.Primary._500} to={logoUrl} isExternal>
                {logoUrl}
              </Link>
            </Flex>
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Description</Text>
            <Text textStyle="p small regular" color={Color.Neutral._700}>
              {description}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Social Channels</Text>
            <Flex direction="column" gap={2} justifyContent="space-between">
              <UnorderedList>
                {daoLinkRecords.map((link, index) => {
                  return (
                    <ListItem>
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
          {isAdminWalletPaired ? (
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
