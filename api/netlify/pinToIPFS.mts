
import type { Context } from "@netlify/functions";

import { pinata, pinMarkdownToIPFS, RequestMethods } from "../_utils/_index.js";


export default async (request: Request, context: Context) => {
  if (request.method !== RequestMethods.POST) {
    return new Response(JSON.stringify({ error: "bad method" }), { status: 502 });

  }
  if (!request.body) {
    return new Response(JSON.stringify({ error: "no body" }), { status: 502 });

  }
    const arePinataAuthCredentialsValid = await pinata.testAuthentication();
    if (!arePinataAuthCredentialsValid.authenticated) {
      //return response.status(401).json({ error: "Pinata IPFS service authentication credentials are invalid." });
      return new Response(JSON.stringify({ error: "Pinata IPFS service authentication credentials are invalid." }), { status: 401 });
    }

    let h = request.headers;

    const reader = await request.body.getReader().read();
    if (!reader.value) {
      return new Response(JSON.stringify({ error: "no value" }), { status: 502 });
    }
    let b =  JSON.parse(new TextDecoder().decode(reader.value))
  //  console.log('headers',h)
    console.log('body=>',b)

    const { metadata, fileName }=b;
    try {
      if (metadata === "" || metadata === undefined) {
//        return response.status(400).json({ error: "Metadata cannot be empty." });
        return new Response(JSON.stringify({ error: "Metadata cannot be empty." }), { status: 400 });

      }
      if (fileName === "" || fileName === undefined) {
        //     return response.status(400).json({ error: "File name cannot be empty." });
        return new Response(JSON.stringify({ error: "File name cannot be empty." }), { status: 400 });

      }
      const pinataResponse = await pinMarkdownToIPFS(metadata, fileName);
      return new Response(JSON.stringify(pinataResponse), { status: 200 });
      //return response.status(200).json(pinataResponse);
    } catch (error) {
//      return response.status(502).json({ error: "Failed to pin data to IPFS." });
      return new Response(JSON.stringify({ error: "Failed to pin data to IPFS." }), { status: 502 });

    }

}
