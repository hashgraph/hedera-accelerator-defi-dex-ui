import { Dispatch } from "react";
import { DEXActions } from "../../context/HashConnectContext";
import { fetchPoolVolumeMetrics } from "./actions/mirrorNodeActions";

export interface UseMirrorNodeProps {
  /* TODO: Dispatch Type should be updated to match Mirro Node action types */
  dispatch: Dispatch<DEXActions>;
  network: string;
}

export interface UseMirrorNodeDispatchers {
  fetchPoolVolumeMetrics: () => void;
}

export const initialMirrorNodeDispatchers = {
  fetchPoolVolumeMetrics: () => Promise.resolve(),
};

const useMirrorNode = ({ dispatch, network = "testnet" }: UseMirrorNodeProps): UseMirrorNodeDispatchers => {
  return {
    fetchPoolVolumeMetrics: () => dispatch(fetchPoolVolumeMetrics()),
  };
};

export { useMirrorNode };
