import axios from "axios";

const fetchTokenBalances = async () => {
  const testnetURL = `https://testnet.mirrornode.hedera.com`;
  const mainnetURL = `https://mainnet-public.mirrornode.hedera.com/`;
  return await axios.get(`${testnetURL}/api/v1/tokens/0.0.47646195/balances`, {
    params: {
      limit: 2,
      order: "asc",
      timestamp: 1664260471,
    },
  });
};

export { fetchTokenBalances };
