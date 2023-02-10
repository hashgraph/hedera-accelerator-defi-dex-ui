import {
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  HStack,
  VStack,
  Text,
  Spacer,
  Popover as ChakraPopOver,
} from "@chakra-ui/react";
import { Color } from "../../themes";

interface PopoverData {
  value: string | number;
  label?: string;
  labelTextStyle?: any;
  valueTextStyle?: any;
}

interface PopoverProps {
  triggerBody: React.ReactNode;
  triggerType: "click" | "hover";
  triggerBodystyle?: any;
  data: PopoverData[];
  children?: React.ReactNode;
}

const getPopoverDataBody = (data: PopoverData) => {
  return (
    <VStack>
      <Text textStyle="h4" style={{ ...data.labelTextStyle }}>
        {data.label}
      </Text>
      <Text textStyle="h2" style={{ ...data.valueTextStyle }}>
        {data.value}
      </Text>
    </VStack>
  );
};

export function Popover(props: PopoverProps) {
  const { data, triggerBody, triggerType, triggerBodystyle } = props;
  return (
    <ChakraPopOver trigger={triggerType}>
      <PopoverTrigger>{triggerBody}</PopoverTrigger>
      <PopoverContent width="100%" border="hidden">
        <PopoverBody
          width="fit-content"
          background={Color.White_01}
          border={`0.25px solid ${Color.Grey_01}`}
          boxShadow={"0px 4px 15px rgba(0, 0, 0, 0.15)"}
          style={{ ...triggerBodystyle }}
        >
          <HStack spacing={5}>
            {data.map((popOverdata) => {
              return getPopoverDataBody(popOverdata);
            })}
          </HStack>
          <Spacer />
        </PopoverBody>
      </PopoverContent>
    </ChakraPopOver>
  );
}
