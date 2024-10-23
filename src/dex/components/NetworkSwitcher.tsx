import { Flex, Select, Button } from "@chakra-ui/react";
import { LedgerId } from "@hashgraph/sdk";
import { useState } from "react";
import { useDexContext } from "@dex/hooks";
import { getDefaultLedgerId } from "shared";

const networkSelectOptions: LedgerId[] = [LedgerId.MAINNET, LedgerId.TESTNET, LedgerId.PREVIEWNET];
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
    <Flex direction="column" maxWidth={200}>
      <Select
        value={selectedNetwork?.toString()}
        height={39}
        mb="1"
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
      <Button variant="primary" onClick={handleSwitchNetwork} disabled={selectedNetwork == defaultSelectedNetwork}>
        Change network
      </Button>
    </Flex>
  );
}
