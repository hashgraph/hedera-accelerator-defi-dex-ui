import * as MultiSigDAOService from "./MultiSigDAOService";
import * as TokenDAOService from "./TokenDAOService";
import * as NFTDAOService from "./NFTDAOService";
const DAOService = { ...MultiSigDAOService, ...TokenDAOService, ...NFTDAOService };
export default DAOService;
export * from "./type";
