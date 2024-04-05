import type { Context } from "@netlify/functions";

//import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { isCIDValid, RequestMethods } from "../_utils/_index.js";

type QueryParams = {
  query: {
    CID: string;
  };
};

export default async  (request: Request , context: Context)=> {
  if (request.method === RequestMethods.GET) {
    let url = new URL(request.url)

    const CID = url.searchParams.get("CID")

    if (CID == undefined) {
      return new Response(JSON.stringify({ error: "CID is not present." }), { status: 401 });

    }
    if (!isCIDValid(CID)) {
   //   return response.status(400).json({ error: "CID is invalid." });
      return new Response(JSON.stringify({ error: "CID is invalid." }), { status: 401 });

    }

    try {
      const { VITE_PUBLIC_PINATA_GATEWAY_URL } = process.env;

      if (VITE_PUBLIC_PINATA_GATEWAY_URL == undefined) {
        return new Response(JSON.stringify({ error: "gateway not defined" }), { status: 401 });

      }
      const pinataResponse = await axios.get(`${VITE_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${CID}`);
      //return response.status(200).json(pinataResponse.data);
      return new Response(JSON.stringify(pinataResponse.data), { status: 200 });

    } catch (error) {
     // return response.status(502).json({ error });
      return new Response(JSON.stringify({ error: error }), { status: 502 });

    }
  }
}
