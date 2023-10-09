import { GovernanceDAODetails, Member } from "@dao/services";
import { MirrorNodeTokenById } from "@dex/services";
import { TokenBalance } from "@dex/hooks";

export type GovernanceDAODetailsContext = {
  dao: GovernanceDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
  FTToken: MirrorNodeTokenById | undefined;
};
