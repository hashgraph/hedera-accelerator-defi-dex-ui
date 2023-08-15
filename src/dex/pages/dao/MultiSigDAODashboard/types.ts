import { TokenBalance } from "@dex/hooks";
import { Member, MultiSigDAODetails } from "@dex/services";

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
