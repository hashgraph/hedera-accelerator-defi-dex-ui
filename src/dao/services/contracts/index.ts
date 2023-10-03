export * from "./MultiSigDAOService";
export * from "./TokenDAOService";
export * from "./NFTDAOService";
import * as MultiSigDAOService from "./MultiSigDAOService";
import * as TokenDAOService from "./TokenDAOService";
import * as NFTDAOService from "./NFTDAOService";
const DAOService = { ...MultiSigDAOService, ...TokenDAOService, ...NFTDAOService };
export default DAOService;
export * from "./types";
