import { UserPool } from "@dex/store/poolsSlice";

const findPoolByLpToken = (tokenSymbol: string, userPools: UserPool[]) => {
  return (
    userPools.length > 0 &&
    userPools.find((poolMetric) => poolMetric.userTokenPair?.lpTokenMeta.lpAccountId === tokenSymbol)
  );
};

export { findPoolByLpToken };
