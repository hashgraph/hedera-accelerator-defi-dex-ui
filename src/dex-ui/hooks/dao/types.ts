export enum DAOQueries {
  FetchAllDAOs = "getDAOs",
  FetchDAODetails = "getDaoDetail",
}

export enum DAOMutations {
  CreateDAO = "createDAO",
}

export interface Social {
  key: string;
  value: string;
}

export interface DAO {
  name: string;
  logoUrl: string;
  webLinks: Social[];
}
