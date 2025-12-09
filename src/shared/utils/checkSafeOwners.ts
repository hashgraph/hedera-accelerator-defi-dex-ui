/**
 * Utility to check the actual owners of a Gnosis Safe contract
 * This helps debug GS030 errors
 */

import { ethers } from "ethers";

// Gnosis Safe ABI - just the functions we need
const GNOSIS_SAFE_ABI = [
  "function getOwners() external view returns (address[] memory)",
  "function isOwner(address owner) external view returns (bool)",
  "function getThreshold() external view returns (uint256)",
];

export async function checkSafeOwners(safeEvmAddress: string, network: "testnet" | "mainnet" = "testnet") {
  try {
    // Hedera JSON-RPC endpoints
    const rpcUrl = network === "testnet" ? "https://testnet.hashio.io/api" : "https://mainnet.hashio.io/api";

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const safeContract = new ethers.Contract(safeEvmAddress, GNOSIS_SAFE_ABI, provider);

    console.log("[CHECK SAFE] Checking Safe at EVM address:", safeEvmAddress);

    // Get owners
    const owners = await safeContract.getOwners();
    console.log("[CHECK SAFE] Owners:", owners);

    // Get threshold
    const threshold = await safeContract.getThreshold();
    console.log("[CHECK SAFE] Threshold:", threshold.toString());

    // Convert EVM addresses to Hedera account IDs for display
    console.log("[CHECK SAFE] ========================================");
    console.log("[CHECK SAFE] Safe has", owners.length, "owner(s)");
    console.log("[CHECK SAFE] Threshold:", threshold.toString());
    owners.forEach((owner: string, index: number) => {
      console.log(`[CHECK SAFE] Owner ${index + 1}: ${owner}`);
    });
    console.log("[CHECK SAFE] ========================================");

    return { owners, threshold: threshold.toString() };
  } catch (error) {
    console.error("[CHECK SAFE] Error checking Safe owners:", error);
    throw error;
  }
}

export async function isAddressOwner(
  safeEvmAddress: string,
  addressToCheck: string,
  network: "testnet" | "mainnet" = "testnet"
) {
  try {
    const rpcUrl = network === "testnet" ? "https://testnet.hashio.io/api" : "https://mainnet.hashio.io/api";

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const safeContract = new ethers.Contract(safeEvmAddress, GNOSIS_SAFE_ABI, provider);

    const isOwner = await safeContract.isOwner(addressToCheck);
    console.log(`[CHECK SAFE] Is ${addressToCheck} an owner?`, isOwner);

    return isOwner;
  } catch (error) {
    console.error("[CHECK SAFE] Error checking if address is owner:", error);
    throw error;
  }
}
