import { HTSMutations } from "./types";
import { useMutation } from "react-query";
import { DexService, MirrorNodeAccountById } from "../../services";
import { useDexContext } from "../useDexContext";

export function useFetchAccountInfo() {
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  return useMutation<MirrorNodeAccountById, Error, undefined, HTSMutations.AccountInfo>(() => {
    return DexService.fetchAccountInfo(wallet.savedPairingData?.accountIds[0] ?? "");
  });
}
