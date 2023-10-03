import { useMutation, UseMutationResult } from "react-query";
import { DAOMutations } from "../types";
import { isNil } from "ramda";
import { PinataPinResponse } from "@pinata/sdk";
import { toast } from "react-toastify";
import { IPFSToast } from "@shared/ui-kit";
import daoSDK from "@dao/services";

const { VITE_PUBLIC_PINATA_GATEWAY_URL } = import.meta.env;

interface UsePinToIPFSParams {
  fileName: string;
  metadata: string;
}

export function usePinToIPFS(): UseMutationResult<
  PinataPinResponse,
  Error,
  UsePinToIPFSParams,
  DAOMutations.PinToIPFS
> {
  return useMutation<PinataPinResponse, Error, UsePinToIPFSParams, DAOMutations.PinToIPFS>(
    async (params: UsePinToIPFSParams) => {
      const { fileName, metadata } = params;
      return daoSDK.pinMarkdownToIPFS(metadata, fileName);
    },
    {
      onSuccess: (pinResponse: PinataPinResponse) => {
        if (isNil(pinResponse)) return;
        const { IpfsHash } = pinResponse;
        const message = "IPFS pinning successful.";
        toast.success(<IPFSToast gatewayURL={VITE_PUBLIC_PINATA_GATEWAY_URL} message={message} CID={IpfsHash} />);
      },
    }
  );
}
