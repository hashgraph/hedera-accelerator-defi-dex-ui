import { Dispatch } from "react";
import { MirrorNodeAction } from "./actions/actionTypes";
import { fetchPoolVolumeMetrics } from "./actions/mirrorNodeActions";

export interface UseMirrorNodeProps {
  dispatch: Dispatch<MirrorNodeAction>;
  network: string;
}

// export interface UseMirrorNodeDispatch = dispatch: (value: MirrorNodeAction) => void
const useMirrorNode = ({ dispatch, network = "testnet" }: UseMirrorNodeProps) => {
  return {
    fetchPoolVolumeMetrics: () => dispatch(fetchPoolVolumeMetrics()),
  };
};

export { useMirrorNode };
