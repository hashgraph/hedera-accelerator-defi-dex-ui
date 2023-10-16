import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { isCIDValid, RequestMethods } from "./_utils/_index.js";

type QueryParams = {
  query: {
    CID: string;
  };
};

export default async function fetchContentFromPinata(request: VercelRequest & QueryParams, response: VercelResponse) {
  if (request.method === RequestMethods.GET) {
    const CID = request.query.CID;

    if (!isCIDValid(CID)) {
      return response.status(400).json({ error: "CID is invalid." });
    }

    try {
      const { VITE_PUBLIC_PINATA_GATEWAY_URL } = process.env;
      const pinataResponse = await axios.get(`${VITE_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${CID}`);
      return response.status(200).json(pinataResponse.data);
    } catch (error) {
      return response.status(502).json({ error });
    }
  }
}
