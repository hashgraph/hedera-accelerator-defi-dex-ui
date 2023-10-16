import { useMutation, UseMutationResult } from "react-query";
import { DAOMutations } from "../types";
import { isNil } from "ramda";
import { PinataPinResponse } from "@pinata/sdk";
import { toast } from "react-toastify";
import { IPFSToast } from "@shared/ui-kit";
import daoSDK from "@dao/services";
import { AxiosError } from "axios";

const { VITE_PUBLIC_PINATA_GATEWAY_URL } = import.meta.env;

type PinToIPFSError = {
  error: string;
};

interface UsePinToIPFSParams {
  fileName: string;
  metadata: string;
}

export function usePinToIPFS(): UseMutationResult<
  PinataPinResponse,
  AxiosError<PinToIPFSError, any>,
  UsePinToIPFSParams,
  DAOMutations.PinToIPFS
> {
  return useMutation<PinataPinResponse, AxiosError<PinToIPFSError, any>, UsePinToIPFSParams, DAOMutations.PinToIPFS>(
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
