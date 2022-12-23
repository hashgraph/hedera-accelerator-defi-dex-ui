import governorAbi from "../abi/GovernorCountingSimpleInternal.json";
import Web3 from "web3";

const web3 = new Web3();
const governorAbiSignatureMap = loadGovernorAbiEventSignatures();

function loadGovernorAbiEventSignatures() {
  const governorAbiSignatureMap = new Map<string, any>();
  governorAbi.abi.forEach((eventAbi: any) => {
    if (eventAbi.type === "event") {
      const signature = web3.eth.abi.encodeEventSignature(eventAbi);
      governorAbiSignatureMap.set(signature, eventAbi);
    }
  });
  return governorAbiSignatureMap;
}

export { governorAbiSignatureMap };
