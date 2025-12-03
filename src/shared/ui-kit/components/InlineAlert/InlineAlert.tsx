import { Flex } from "@chakra-ui/react";
import { Color, useTheme } from "../../themes";
import { ReactNode } from "react";
import { ToastWarningIcon, ToastErrorIcon, ToastInfoIcon, ToastSuccessIcon } from "../Icons";
import { Text } from "../Text";

export enum InlineAlertType {
  Info = "Info",
  Warning = "Warning",
  Error = "Error",
  Success = "Success",
}

interface InlineAlertTypeStyles {
  icon: ReactNode;
  borderColor: string;
  bgOpacity: string;
}

function getInlineAlertTypeStyles(type: InlineAlertType): InlineAlertTypeStyles {
  switch (type) {
    case InlineAlertType.Info: {
      return {
        icon: <ToastInfoIcon h={4} w={4} marginTop="2px" />,
        borderColor: Color.Primary._500,
        bgOpacity: "rgba(126, 34, 206, 0.15)",
      };
    }
    case InlineAlertType.Warning: {
      return {
        icon: <ToastWarningIcon h={4} w={4} marginTop="2px" />,
        borderColor: Color.Warning._500,
        bgOpacity: "rgba(245, 158, 11, 0.15)",
      };
    }
    case InlineAlertType.Error: {
      return {
        icon: <ToastErrorIcon h={5} w={5} />,
        borderColor: Color.Destructive._500,
        bgOpacity: "rgba(239, 68, 68, 0.15)",
      };
    }
    case InlineAlertType.Success: {
      return {
        icon: <ToastSuccessIcon h={5} w={5} />,
        borderColor: Color.Success._500,
        bgOpacity: "rgba(34, 197, 94, 0.15)",
      };
    }
    default:
      return {
        icon: <></>,
        borderColor: "",
        bgOpacity: "",
      };
  }
}

interface InlineAlertProps {
  title?: string;
  message: string;
  type: InlineAlertType;
}

/**
 * An alert message element that presents timely information within content areas
 * as close as possible to the thing that it's about.
 */
export function InlineAlert(props: InlineAlertProps) {
  const theme = useTheme();
  const { title, message, type = InlineAlertType.Info } = props;
  const { icon, borderColor, bgOpacity } = getInlineAlertTypeStyles(type);
  return (
    <Flex
      direction="row"
      gap="2"
      padding="0.75rem"
      borderRadius="12px"
      bg={bgOpacity}
      border={`1px solid ${borderColor}`}
    >
      {icon}
      <Flex direction="column" gap="1">
        {title && <Text.P_Small_Medium color={theme.text}>{title}</Text.P_Small_Medium>}
        <Text.P_Small_Regular color={theme.text}>{message}</Text.P_Small_Regular>
      </Flex>
    </Flex>
  );
}
