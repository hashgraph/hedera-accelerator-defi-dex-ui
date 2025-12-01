import { Select } from "@chakra-ui/react";
import { LedgerId } from "@hashgraph/sdk";
import { useDexContext } from "@dex/hooks";
import { getDefaultLedgerId } from "shared";
import { Color } from "@shared/ui-kit";

const networkSelectOptions: LedgerId[] = [LedgerId.MAINNET, LedgerId.TESTNET];
const defaultSelectedNetwork = getDefaultLedgerId();

export function NetworkSwitcher() {
  const { wallet } = useDexContext((context) => context);

  const handleSelectNetwork = (e: { target: { value: string } }) => {
    const selected = e.target.value;
    const newNetwork = LedgerId.fromString(selected);

    if (newNetwork.toString() !== defaultSelectedNetwork.toString()) {
      wallet.reconnect(newNetwork);
    }
  };

  return (
    <Select
      value={defaultSelectedNetwork?.toString()}
      height="40px"
      color={Color.Neutral._700}
      fontSize={14}
      minWidth="120px"
      maxWidth="140px"
      borderRadius="8px"
      border={`1px solid ${Color.Neutral._200}`}
      bg={Color.White}
      cursor="pointer"
      _hover={{ borderColor: Color.Neutral._300 }}
      _focus={{ borderColor: Color.Primary._500, boxShadow: "none" }}
      id="network-switcher-select"
      onChange={handleSelectNetwork}
    >
      {networkSelectOptions.map((networkId) => (
        <option key={networkId.toString()} value={networkId.toString()}>
          {networkId.toString().charAt(0).toUpperCase() + networkId.toString().slice(1)}
        </option>
      ))}
    </Select>
  );
}
