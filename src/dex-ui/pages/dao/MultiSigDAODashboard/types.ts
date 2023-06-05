import { TokenBalance } from "@hooks";
import { Member, MultiSigDAODetails } from "@services";

export type MultiSigDAODetailsContext = {
  dao: MultiSigDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
};

export const DefaultMultiSigDAODetails = {
  accountId: "",
  safeId: "",
  ownerIds: [],
  threshold: 0,
};
