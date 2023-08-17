import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Tag, Text, Flex, Link, TagCloseButton, Box } from "@chakra-ui/react";
import { Color } from "../../themes";

export enum NotficationTypes {
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

interface NotificationProps {
  type: NotficationTypes;
  bg?: string;
  textStyle?: string;
  message: string;
  isLinkShown?: boolean;
  linkText?: string;
  linkRef?: string;
  isVisible?: boolean;
  isCloseButtonShown?: boolean;
  isButton?: boolean;
  handleLinkClick?: () => void;
  handleClickClose?: () => void;
}

/**
 * A component used to communicate to a user a state that affects a system, feature or page.
 * TODO: Add TSDocs
 */
export const Notification = (props: NotificationProps) => {
  const {
    type = NotficationTypes.WARNING,
    bg,
    textStyle = "b2",
    message,
    isLinkShown = false,
    linkText,
    linkRef,
    isCloseButtonShown = false,
    isVisible = true,
    isButton = false,
    handleLinkClick,
    handleClickClose,
  } = props;

  function getNotificationColors() {
    if (bg) {
      return { bg, text: Color.Black_01 };
    }
    if (type === NotficationTypes.SUCCESS) {
      return { bg: Color.Green_01_Opaque, text: Color.Black_01 };
    }
    if (type === NotficationTypes.WARNING) {
      return { bg: Color.Yellow__01_Opaque, text: Color.Black_01 };
    }
    if (type === NotficationTypes.ERROR) {
      return { bg: Color.Red_01_Opaque, text: Color.Black_01 };
    }
  }

  if (!isVisible) {
    return <></>;
  }

  /** The Alert component is most likely prefered over using Tag for this components. */
  return (
    <Tag
      width="100%"
      padding="0.5rem"
      backgroundColor={getNotificationColors()?.bg}
      borderRadius="5px"
      textAlign="left"
    >
      <Flex flexWrap="wrap" width="100%">
        <Text textStyle={textStyle} color={getNotificationColors()?.text}>
          {message} &nbsp;
        </Text>
        {isLinkShown ? (
          <Link
            width="fit-content"
            display="flex"
            alignItems="center"
            color="#0180FF"
            {...(isButton ? { onClick: handleLinkClick } : { href: linkRef, isExternal: true })}
          >
            <Text variant="link" textDecoration="underline">
              {linkText}
            </Text>
            {isButton ? <></> : <ExternalLinkIcon margin="0rem 0.125rem" />}
          </Link>
        ) : (
          <></>
        )}
      </Flex>
      {isCloseButtonShown ? (
        <Box flex="1">
          <TagCloseButton float="right" color={getNotificationColors()?.text} onClick={handleClickClose} />
        </Box>
      ) : (
        <></>
      )}
    </Tag>
  );
};
