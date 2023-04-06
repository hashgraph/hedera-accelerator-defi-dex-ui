import { Flex, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { MultiSigDAODashboard } from "./MultiSigDAODashboard";
import { DashboardLayout, PageHeader } from "../../layouts";
import { PrimaryHeaderButton } from "../../components";
import { Paths } from "../../DEX";
import { DAOType } from "../CreateADAO";

export function ViewDAODetailsPage() {
  const { address = "" } = useParams();
  // fetch by address, determine what type of DAO, show view based on DAO type
  const dao = {
    name: "Best DAO",
    type: DAOType.MultiSig,
    threshold: 2,
    admin: "z",
    owners: ["a", "b", "c"],
    assets: [
      { name: "a", address: "a", amount: 123.32 },
      { name: "b", address: "b", amount: 123.32 },
      { name: "c", address: "c", amount: 123.32 },
    ],
  };

  return (
    <DashboardLayout
      header={
        <PageHeader
          leftContent={[
            <Flex direction="column">
              <Text textStyle="h2">{dao.name}</Text>
              <Text textStyle="b4">{dao.type}</Text>
              <Text textStyle="b4">{address}</Text>
              <Text textStyle="b4">
                Required Confirmations: {dao.threshold} out of {dao.owners.length} owners.
              </Text>
            </Flex>,
          ]}
          rightContent={[<PrimaryHeaderButton name="New Transaction" route={Paths.DAOs.CreateDAO} />]}
        />
      }
      body={<MultiSigDAODashboard address={address} />}
    />
  );
}
