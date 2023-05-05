import { Paths } from "@routes";
import { useNavigate, useParams } from "react-router-dom";
import { NotFound } from "@layouts";

export function NFTDAODashboard() {
  const navigate = useNavigate();
  const { accountId = "" } = useParams();

  function onBackToDAOsLinkClick() {
    navigate(Paths.DAOs.absolute);
  }

  return (
    <NotFound
      message={`The dashboard for 'NFT' type DAOs is under construction (DAO ID: ${accountId}).`}
      preLinkText={""}
      linkText={"Click here to return to the DAOs list page."}
      onLinkClick={onBackToDAOsLinkClick}
    />
  );
}
