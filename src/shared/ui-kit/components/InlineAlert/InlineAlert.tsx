import { Flex } from "@chakra-ui/react";
import { Color } from "../../themes";
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
  bg: string;
}

function getInlineAlertTypeStyles(type: InlineAlertType): InlineAlertTypeStyles {
  switch (type) {
    case InlineAlertType.Info: {
      return {
        icon: <ToastInfoIcon h={4} w={4} marginTop="2px" />,
        borderColor: Color.Primary._300,
        bg: Color.Primary._50,
      };
    }
    case InlineAlertType.Warning: {
      return {
        icon: <ToastWarningIcon h={4} w={4} marginTop="2px" />,
        borderColor: Color.Warning._300,
        bg: Color.Warning._50,
      };
    }
    case InlineAlertType.Error: {
      return {
        icon: <ToastErrorIcon h={5} w={5} />,
        borderColor: Color.Destructive._300,
        bg: Color.Destructive._50,
      };
    }
    case InlineAlertType.Success: {
      return {
        icon: <ToastSuccessIcon h={5} w={5} />,
        borderColor: Color.Success._300,
        bg: Color.Success._50,
      };
    }
    default:
      return {
        icon: <></>,
        borderColor: "",
        bg: "",
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
  const { title, message, type = InlineAlertType.Info } = props;
  const { icon, borderColor, bg } = getInlineAlertTypeStyles(type);
  return (
    <Flex direction="row" gap="2" padding="0.5rem" borderRadius="0.375rem" bg={bg} border={`1px solid ${borderColor}`}>
      {icon}
      <Flex direction="column" gap="1">
        {title && <Text.P_Small_Medium>{title}</Text.P_Small_Medium>}
        <Text.P_Small_Regular color={Color.Neutral._700}>{message}</Text.P_Small_Regular>
      </Flex>
    </Flex>
  );
}
