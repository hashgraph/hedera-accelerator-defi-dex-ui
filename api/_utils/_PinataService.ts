import pinataSDK, { PinataPinResponse } from "@pinata/sdk";
import axios from "axios";

const { PRIVATE_PINATA_API_KEY, PRIVATE_PINATA_API_SECRET_KEY } = process.env;

export const pinata = new pinataSDK(PRIVATE_PINATA_API_KEY, PRIVATE_PINATA_API_SECRET_KEY);

export async function pinMarkdownToIPFS(metadata: string, fileName: string): Promise<PinataPinResponse> {
  const pinURL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const markdownFileName = `${fileName}.md`;

  const formData = new FormData();
  formData.append("name", markdownFileName);
  formData.append("file", new Blob([metadata], { type: "application/octet-stream" }), markdownFileName);

  const options = {
    headers: {
      accept: "application/json",
      pinata_api_key: PRIVATE_PINATA_API_KEY,
      pinata_secret_api_key: PRIVATE_PINATA_API_SECRET_KEY,
    },
  };

  const pinataResponse = await axios.post<PinataPinResponse>(pinURL, formData, options);
  return pinataResponse.data;
}

export function isCIDValid(CID: string) {
  const CIDRegex = /^[a-zA-Z0-9]+$/;
  if (typeof CID === "string" && CID.length === 46 && CID.startsWith("Qm") && CIDRegex.test(CID)) {
    return true;
  }
  return false;
}
