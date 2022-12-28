import governorAbi from "../abi/GovernorCountingSimpleInternal.json";
import Web3 from "web3";
import { EventAbi } from "../abi/types";

const web3 = new Web3();
const governorAbiSignatureMap = loadGovernorAbiEventSignatures();

function loadGovernorAbiEventSignatures() {
  const governorAbiSignatureMap = new Map<string, EventAbi>();
  governorAbi.abi.forEach((abi: any) => {
    if (abi.type === "event") {
      const eventAbi = abi as EventAbi;
      const signature = web3.eth.abi.encodeEventSignature(eventAbi);
      governorAbiSignatureMap.set(signature, eventAbi);
    }
  });
  return governorAbiSignatureMap;
}

export { governorAbiSignatureMap };
