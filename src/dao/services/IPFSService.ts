import { PinataPinResponse } from "@pinata/sdk";
import axios from "axios";

export async function pinMarkdownToIPFS(metadata: string, fileName: string): Promise<PinataPinResponse> {
  const data = {
    metadata,
    fileName,
  };
  const pinataResponse = await axios.post<PinataPinResponse>(`/api/pinToIPFS`, data);
  if (pinataResponse.status === 200) {
    return pinataResponse.data;
  } else {
    throw new Error("Failed to pin content to IPFS.");
  }
}

export async function fetchFileByCID(CID: string): Promise<string> {
  const pinataResponse = await axios.get(`/api/ipfs`, { params: { CID } });
  if (pinataResponse.status === 200) {
    return pinataResponse.data;
  } else {
    throw new Error(`Failed to fetch content with CID: ${CID} from IPFS.`);
  }
}
