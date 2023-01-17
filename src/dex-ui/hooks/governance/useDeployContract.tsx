import { DexService } from "../../services";
import { GovernanceMutations } from "./types";
import { useMutation } from "react-query";

interface Response {
  id: string;
  address: string;
}

interface UseDeployContractParams {
  abiFile: string;
}

export function useDeployContract() {
  return useMutation<Response | undefined, Error, UseDeployContractParams, GovernanceMutations.DeployContract>(
    (params: UseDeployContractParams) => {
      const { abiFile } = params;
      return DexService.deployABIFile(abiFile);
    }
  );
}
