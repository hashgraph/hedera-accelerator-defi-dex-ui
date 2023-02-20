import { UserPool } from "../../store/poolsSlice";

const findPoolByLpToken = (tokenSymbol: string, userPools: UserPool[]) => {
  return (
    userPools.length > 0 &&
    userPools.find((poolMetric) => poolMetric.userTokenPair?.pairToken.pairLpAccountId === tokenSymbol)
  );
};

export { findPoolByLpToken };
