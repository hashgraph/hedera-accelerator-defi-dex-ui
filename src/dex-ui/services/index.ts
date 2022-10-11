import { createHederaService } from "./HederaService";
import { createMirrorNodeService } from "./MirrorNodeService";
import { createWalletService } from "./WalletService";

export * from "./WalletService";
export * from "./HederaService";
export * from "./MirrorNodeService";
export * from "./constants";

const MirrorNodeService = createMirrorNodeService();
const WalletService = createWalletService();
const HederaService = createHederaService();

export { MirrorNodeService, WalletService, HederaService };
