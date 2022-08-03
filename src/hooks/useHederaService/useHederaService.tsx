import { HederaServiceContext } from "./HederaServiceContext";

import { useContext } from "react";

const useHederaService = () => {
  return useContext(HederaServiceContext);
};

export { useHederaService };
