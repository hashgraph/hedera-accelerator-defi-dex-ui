import governor from "../../../dex/services/abi/GovernorCountingSimpleInternal.json";
import multiSigDAOFactory from "../../../dex/services/abi/MultiSigDAOFactory.json";
import hederaGnosisSafe from "../../../dex/services/abi/HederaGnosisSafe.json";
import multiSigDAO from "../../../dex/services/abi/MultiSigDAO.json";
import GODHolder from "../../../dex/services/abi/GODHolder.json";
import PatternProxy from "../../../dex/services/abi/ProxyPattern.json";
import FTDAO from "../../../dex/services/abi/FTDAO.json";
import FTDAOFactory from "../../../dex/services/abi/FTDAOFactory.json";
import HederaGovernor from "../../../dex/services/abi/HederaGovernor.json";
import AssetHolder from "../../../dex/services/abi/AssetHolder.json";
import GovernorTransferToken from "../../../dex/services/abi/GovernorTransferToken.json";
import SystemRoleBasedAccess from "../../../dex/services/abi/SystemRoleBasedAccess.json";
import Web3 from "web3";
import { EventAbi } from "../../../dex/services/abi/types";

const web3 = new Web3();
const abiSignatures = loadGovernorAbiEventSignatures();

function loadGovernorAbiEventSignatures() {
  const abiSignatures = new Map<string, EventAbi>();
  const abis = [
    ...governor.abi,
    ...multiSigDAOFactory.abi,
    ...hederaGnosisSafe.abi,
    ...multiSigDAO.abi,
    ...GODHolder.abi,
    ...PatternProxy.abi,
    ...FTDAO.abi,
    ...FTDAOFactory.abi,
    ...GovernorTransferToken.abi,
    ...HederaGovernor.abi,
    ...AssetHolder.abi,
    ...SystemRoleBasedAccess.abi,
  ];
  abis.forEach((abi: any) => {
    if (abi.type === "event") {
      const eventAbi = abi as EventAbi;
      const signature = web3.eth.abi.encodeEventSignature(eventAbi);
      abiSignatures.set(signature, eventAbi);
    }
  });
  return abiSignatures;
}

export { abiSignatures };
