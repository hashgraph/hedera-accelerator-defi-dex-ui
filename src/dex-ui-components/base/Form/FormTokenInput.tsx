import { Text, Flex, Button, Divider } from "@chakra-ui/react";
import { FormInput, FormInputProps } from "../Inputs";
import { Color } from "@dex-ui-components/themes";

interface RightUnitContentProps {
  tokenSymbol: string | undefined;
  handleHalfButtonClicked: () => void;
  handleMaxButtonClicked: () => void;
}

function RightUnitContent(props: RightUnitContentProps) {
  const { tokenSymbol, handleHalfButtonClicked, handleMaxButtonClicked } = props;
  return (
    <Flex alignItems="center" gap="0.25rem">
      <Flex gap="0.25rem">
        <Button variant="link" textStyle="p xsmall regular link" onClick={handleHalfButtonClicked}>
          HALF
        </Button>
        <Button variant="link" textStyle="p xsmall regular link" onClick={handleMaxButtonClicked}>
          MAX
        </Button>
      </Flex>
      <Divider height="27px" orientation="vertical" borderColor={Color.Neutral._300}></Divider>
      <Flex alignItems="center" paddingLeft="0.5rem">
        <Text textStyle="p medium regular">{tokenSymbol ?? "-"}</Text>
      </Flex>
    </Flex>
  );
}

interface LabelProps {
  tokenSymbol: string;
  balance: string;
}

function Label(props: LabelProps) {
  const { balance, tokenSymbol } = props;
  return (
    <Flex alignItems="center" justifyContent="space-between" flex="1">
      <Text textStyle="p small medium">Amount</Text>
      <Flex alignItems="center" gap="3px">
        <Text textStyle="p xsmall regular" color={Color.Neutral._400}>
          Available:&nbsp;
        </Text>
        <Text textStyle="p xsmall semibold" color={Color.Neutral._900}>
          {balance}
        </Text>
        <Text textStyle="p xsmall medium" color={Color.Neutral._400}>
          {tokenSymbol}
        </Text>
      </Flex>
    </Flex>
  );
}

type FormTokenInputProps<T extends string> = FormInputProps<T>;

function FormTokenInput<T extends string>(props: FormTokenInputProps<T>) {
  return <FormInput<T> {...props} />;
}

FormTokenInput.Label = Label;
FormTokenInput.RightUnitContent = RightUnitContent;

export { FormTokenInput };
