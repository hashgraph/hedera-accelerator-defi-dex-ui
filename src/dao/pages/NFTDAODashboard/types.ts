import { Member, NFTDAODetails } from "@dao/services";
import { TokenBalance } from "@dex/hooks";

export type NFTDAODetailsContext = {
  dao: NFTDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
};
