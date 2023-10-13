import { Member, NFTDAODetails } from "@dao/services";
import { TokenBalance } from "@dex/hooks";
import { MirrorNodeTokenById } from "@shared/services";

export type NFTDAODetailsContext = {
  dao: NFTDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
  NFTToken: MirrorNodeTokenById | undefined;
};
