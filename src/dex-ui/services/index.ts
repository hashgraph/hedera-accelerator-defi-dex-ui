import { createDexService } from "./DexService";
import { createHederaService } from "./HederaService";
import { createMirrorNodeService } from "./MirrorNodeService";
import { createWalletService } from "./WalletService";
export * from "./DexService";
export * from "./WalletService";
export * from "./HederaService";
export * from "./MirrorNodeService";
export * from "./constants";

const MirrorNodeService = createMirrorNodeService();
const WalletService = createWalletService();
const HederaService = createHederaService();
/**
 * TODO:
 * - Move all services under a single 'HederaService'.
 * - Rename HederaService to ContractService.
 * - Create an optional useDexService hook that wraps
 *   DexService calls with React Query.
 * */
const DexService = createDexService();

const initializeServices = async () => {
  await HederaService.initHederaService();
};

export { initializeServices, DexService, MirrorNodeService, WalletService, HederaService };
