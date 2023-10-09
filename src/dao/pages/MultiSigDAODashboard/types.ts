import { TokenBalance } from "@dex/hooks";
import { Member, MultiSigDAODetails } from "@dao/services";

export type MultiSigDAODetailsContext = {
  dao: MultiSigDAODetails;
  tokenBalances: TokenBalance[];
  members: Member[];
  totalAssetValue: number;
};

export const DefaultMultiSigDAODetails = {
  accountId: "",
  safeId: "",
  ownerIds: [],
  threshold: 0,
};

export enum DepositTokenModalTabs {
  Fungible = 0,
  NFT,
}
