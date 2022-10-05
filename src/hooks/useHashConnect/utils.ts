import { HashConnectState } from "./reducers/hashConnectReducer";
import { HASHCONNECT_LOCAL_DATA_KEY } from "../constants";

const getLocalHashconnectData = (): HashConnectState | null => {
  const localHashconnectData = localStorage.getItem(HASHCONNECT_LOCAL_DATA_KEY);

  if (localHashconnectData === null) {
    return null;
  }

  try {
    const hashconnectData: HashConnectState = JSON.parse(localHashconnectData);
    return hashconnectData;
  } catch (parseError) {
    console.error(parseError);
    return null;
  }
};

export { getLocalHashconnectData };
