import { Member, NFTDAODetails } from "@services";
import { TokenBalance } from "@hooks";

export type NFTDAODetailsContext = {
  dao: NFTDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
};
