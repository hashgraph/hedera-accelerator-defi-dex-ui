import { createDexService } from "./DexService";
import { createHederaService } from "./HederaService";
import { createJsonRpcService } from "./JsonRpcService";
import { createMirrorNodeService } from "@shared/services/MirrorNodeService";
import { createWalletService } from "@shared/services/WalletService";
export * from "./DexService";
export * from "@shared/services/WalletService";
export * from "./HederaService";
export * from "@shared/services/MirrorNodeService";
export * from "./JsonRpcService";
export * from "./constants";
export * from "./utils";

const MirrorNodeService = createMirrorNodeService();
const WalletService = createWalletService(MirrorNodeService);
const HederaService = createHederaService();
const JsonRpcService = createJsonRpcService();
const DexAPIService = createDexService();

const initializeServices = async () => {
  await HederaService.initHederaService();
};

/** Should renamed to dexAPI */
const DexService = {
  /** Should be renamed to DexService */
  ...DexAPIService,
  ...WalletService,
  ...JsonRpcService,
  ...MirrorNodeService,
  ...HederaService,
};

export { initializeServices, DexService };
