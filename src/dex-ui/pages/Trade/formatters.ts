import { mapObjIndexed } from "ramda";
import BigNumber from "bignumber.js";

const mapBigNumberValuesToNumber = (
  records: Record<string, BigNumber | undefined>
): Record<string, number | undefined> => {
  return mapObjIndexed((record) => record?.toNumber(), records);
};

export { mapBigNumberValuesToNumber };
