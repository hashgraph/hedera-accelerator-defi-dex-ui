import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Tag, Text, Flex, Link, TagCloseButton, Box, HStack } from "@chakra-ui/react";
import { useCallback } from "react";

export enum NotficationTypes {
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

interface NotificationProps {
  type: NotficationTypes;
  textStyle?: string;
  message: string;
  isLinkShown?: boolean;
  linkText?: string;
  linkRef?: string;
  isCloseButtonShown?: boolean;
  handleClickClose?: () => void;
}

export const Notification = (props: NotificationProps) => {
  const {
    type = NotficationTypes.WARNING,
    textStyle = "b2",
    message,
    isLinkShown = false,
    linkText,
    linkRef,
    isCloseButtonShown = false,
    handleClickClose,
  } = props;

  const getNotificationColors = useCallback(() => {
    if (type === NotficationTypes.SUCCESS) {
      return { bg: "#C4F2D3", text: "#23714B" };
    }
    if (type === NotficationTypes.WARNING) {
      return { bg: "#FFF3CB", text: "#9F6000" };
    }
    if (type === NotficationTypes.ERROR) {
      return { bg: "#FFD1D1", text: "#FF1A1A" };
    }
  }, [type]);

  return (
    <Tag width="100%" padding="0.5rem" backgroundColor={getNotificationColors()?.bg} borderRadius="5px">
      <Flex flexWrap="wrap" width="100%">
        <Text textStyle={textStyle} color={getNotificationColors()?.text}>
          {message} &nbsp;
        </Text>
        {isLinkShown ? (
          <Link width="fit-content" display="flex" alignItems="center" color="#0180FF" href={linkRef} isExternal>
            <Text textDecoration="underline">{linkText}</Text>
            <ExternalLinkIcon margin="0rem 0.125rem" />
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
