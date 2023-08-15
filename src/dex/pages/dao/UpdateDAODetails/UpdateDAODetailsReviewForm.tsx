import { Flex, Link, ListItem, Text, UnorderedList, Image } from "@chakra-ui/react";
import { Color, CopyTextButton, DefaultLogoIcon, FormInput } from "@shared/ui-kit";
import { useDexContext } from "@dex/hooks";
import { useFormContext } from "react-hook-form";
import { SettingsForm } from "./types";
import { Link as ReachLink } from "react-router-dom";

export function UpdateDAODetailsReviewForm() {
  const { getValues } = useFormContext<SettingsForm>();
  const { name, description, logoUrl, webLinks } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";

  function handleCopyMemberId(address: string) {
    console.log("Copy Member Address", address);
  }

  return (
    <Flex gap="1.3rem" direction="column">
      <Flex direction="row" flex="7" alignItems="top" gap="0.8rem">
        <Flex flex="1" alignItems="top">
          <Image
            src={logoUrl}
            objectFit="contain"
            borderRadius="full"
            alt="DAO Logo URl"
            boxSize="4rem"
            fallback={<DefaultLogoIcon boxSize="4rem" color={Color.Grey_Blue._100} />}
          />
        </Flex>
        <Flex direction="column" flex="6" gap="1rem" alignItems="start">
          <FormInput<"name">
            inputProps={{
              id: "name",
              label: "Name",
              type: "text",
              value: name,
              isReadOnly: true,
            }}
          />
          <FormInput<"description">
            inputProps={{
              id: "description",
              label: "Description",
              type: "text",
              value: description,
              isReadOnly: true,
            }}
          />
          <Flex direction="column">
            <Text textStyle="p xsmall medium" color={Color.Neutral._500}>
              Social Channels
            </Text>
            <Flex direction="column" justifyContent="space-between">
              <UnorderedList>
                {webLinks.map((link, index) => {
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
          <Flex direction="column" gap="0.5rem">
            <Text textStyle="p xsmall medium" color={Color.Neutral._500}>
              Submitted By
            </Text>
            <Flex gap="0.5rem" alignItems="center">
              <Text textStyle="p small regular" color={Color.Neutral._900}>
                {walletId}
              </Text>
              <CopyTextButton onClick={() => handleCopyMemberId(walletId)} iconSize="17" />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
