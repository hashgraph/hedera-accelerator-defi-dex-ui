import { createDexService } from "./DexService";
import { createHederaService } from "./HederaService";
import { createJsonRpcService } from "./JsonRpcService";
import { createMirrorNodeService } from "./MirrorNodeService";
import { createWalletService } from "./WalletService";
export * from "./DexService";
export * from "./WalletService";
export * from "./HederaService";
export * from "./MirrorNodeService";
export * from "./JsonRpcService";
export * from "./constants";

const MirrorNodeService = createMirrorNodeService();
const WalletService = createWalletService();
const HederaService = createHederaService();
const JsonRpcService = createJsonRpcService();
/** TODO: Replace with React Queries */
const QueryService = createDexService();

const initializeServices = async () => {
  await HederaService.initHederaService();
};

const DexService = {
  ...QueryService,
  ...WalletService,
  ...JsonRpcService,
  ...MirrorNodeService,
  ...HederaService,
};

export { initializeServices, DexService };
