import * as MultiSigDAOService from "./MultiSigDAOService";
import * as TokenDAOService from "./TokenDAOService";
const DAOService = { ...MultiSigDAOService, ...TokenDAOService };
export default DAOService;
export * from "./type";
