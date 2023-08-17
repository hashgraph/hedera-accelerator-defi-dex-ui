import { TokenBalance } from "@dex/hooks";
import { Member, MultiSigDAODetails } from "@dao/services";

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
