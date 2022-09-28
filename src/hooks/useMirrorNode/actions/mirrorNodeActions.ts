import { ActionType, MirrorNodeAction } from "./actionTypes";
import { fetchTokenBalances } from "../services";
import { getErrorMessage } from "../../utils";

const fetchPoolVolumeMetricsStarted = (): MirrorNodeAction => {
  return {
    type: ActionType.FETCH_POOL_VOLUME_METRICS_STARTED,
  };
};

const fetchPoolVolumeMetricsSucceeded = (payload: any): MirrorNodeAction => {
  return {
    type: ActionType.FETCH_POOL_VOLUME_METRICS_SUCCEEDED,
    payload,
  };
};

const fetchPoolVolumeMetricsFailed = (payload: string): MirrorNodeAction => {
  return {
    type: ActionType.FETCH_POOL_VOLUME_METRICS_FAILED,
    payload,
  };
};

const calculatePoolVolumeMetrics = (accountBalances: []) => {
  return accountBalances.reduce((acc: number, value: any): number => acc + value.balance, 0);
};

const fetchPoolVolumeMetrics = (payload?: any) => {
  return async (dispatch: any) => {
    dispatch(fetchPoolVolumeMetricsStarted());
    // const { tokenAccountId, timestamp } = payload;
    try {
      const response = await fetchTokenBalances();
      console.log(response.data);
      const poolVolumeMetrics = calculatePoolVolumeMetrics(response.data.balances);
      console.log(poolVolumeMetrics);
      dispatch(fetchPoolVolumeMetricsSucceeded(poolVolumeMetrics));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(fetchPoolVolumeMetricsFailed(errorMessage));
    }
  };
};

export { fetchPoolVolumeMetrics };
