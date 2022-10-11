import { WALLET_LOCAL_DATA_KEY } from "../../services/constants";

const getLocalWalletData = (): any => {
  const localWalletData = localStorage.getItem(WALLET_LOCAL_DATA_KEY);

  if (localWalletData === null) {
    return null;
  }

  try {
    const walletData = JSON.parse(localWalletData);
    return walletData;
  } catch (parseError) {
    console.error(parseError);
    return null;
  }
};

export { getLocalWalletData };
