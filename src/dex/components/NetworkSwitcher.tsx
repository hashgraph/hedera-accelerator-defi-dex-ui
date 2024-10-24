import { Flex, Select, Button } from "@chakra-ui/react";
import { LedgerId } from "@hashgraph/sdk";
import { useState } from "react";
import { useDexContext } from "@dex/hooks";
import { getDefaultLedgerId } from "shared";
import { Text, Color } from "@shared/ui-kit";

const networkSelectOptions: LedgerId[] = [LedgerId.MAINNET, LedgerId.TESTNET];
const defaultSelectedNetwork = getDefaultLedgerId();

export function NetworkSwitcher() {
  const [selectedNetwork, setSelectedNetwork] = useState<LedgerId>(defaultSelectedNetwork);

  const { wallet } = useDexContext((context) => context);

  const handleSwitchNetwork = () => {
    if (selectedNetwork) {
      wallet.reconnect(selectedNetwork);
    }
  };

  const handleSelectNetwork = (e: { target: { value: string } }) => {
    const selected = e.target.value;

    setSelectedNetwork(LedgerId.fromString(selected));
  };

  return (
    <Flex direction="row" gap="2">
      <Select
        value={selectedNetwork?.toString()}
        height={39}
        color={Color.Primary._500}
        textColor={Color.Primary._500}
        fontSize={14}
        minWidth={120}
        variant="dropDownSelector"
        id="network-switcher-select"
        onChange={handleSelectNetwork}
      >
        {networkSelectOptions
          .map((networkId) => ({
            label: networkId,
            value: networkId,
          }))
          .map((option) => (
            <option
              key={option.value.toString()}
              value={option.value.toString()}
              disabled={option.value === selectedNetwork}
            >
              {option.label.toString()}
            </option>
          ))}
      </Select>
      <Button
        variant="primary"
        minWidth={128}
        onClick={handleSwitchNetwork}
        disabled={selectedNetwork == defaultSelectedNetwork}
      >
        <Text.P_Small_Regular color={Color.White}>Change network</Text.P_Small_Regular>
      </Button>
    </Flex>
  );
}
