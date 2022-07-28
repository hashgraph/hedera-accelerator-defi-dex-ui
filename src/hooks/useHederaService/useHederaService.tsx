import { HederaServiceContext } from "./HederaServiceContext";

import { useContext } from "react";

const useHaderaService = () => {
    return useContext(HederaServiceContext);
};

export { useHaderaService };