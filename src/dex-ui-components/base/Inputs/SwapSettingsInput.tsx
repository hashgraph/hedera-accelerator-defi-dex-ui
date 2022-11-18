import { InfoIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { ChangeEvent } from "react";

export interface SwapSettingsInputProps {
  label: string;
  popoverText: string;
  inputUnit: string;
  value: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const SwapSettingsInput = (props: SwapSettingsInputProps) => {
  return (
    <Flex flexDirection={"column"}>
      <Flex display="flex" alignItems={"center"}>
        <Text fontSize={"xs"}>{props.label}&nbsp;</Text>
        <Popover>
          {({ isOpen, onClose }: any) => (
            <>
              <PopoverTrigger>
                <InfoIcon boxSize={3} color="#0000008A" cursor={"pointer"} />
              </PopoverTrigger>
              <PopoverContent width={"144px"} boxShadow={"0px 4px 4px #00000040"}>
                <PopoverArrow />
                <PopoverBody padding={"6px"} display={"flex"} flexDirection={"column"}>
                  <Text fontSize={"8px"} lineHeight={"10px"} fontWeight={"500"}>
                    {props.popoverText}
                  </Text>
                  <Button
                    padding="0"
                    marginTop={"4px"}
                    justifyContent={"flex-start"}
                    variant="xs-text"
                    fontSize={"8px"}
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </>
          )}
        </Popover>
      </Flex>
      <InputGroup width={"169px"} borderRadius={"8px"} border={"1px solid black"}>
        <Input textAlign={"end"} backgroundColor={"white"} onChange={props.onInputChange} value={props.value} />
        <InputRightElement pointerEvents="none" children={props.inputUnit} />
      </InputGroup>
    </Flex>
  );
};

export { SwapSettingsInput };
