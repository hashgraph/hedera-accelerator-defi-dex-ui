import type { VercelRequest, VercelResponse } from "@vercel/node";
import { RequestMethods, pinata, pinMarkdownToIPFS } from "./_utils/_index.js";

type RequestBody = {
  metadata: string;
  fileName: string;
};

export default async function pinToIPFS(request: VercelRequest, response: VercelResponse) {
  if (request.method === RequestMethods.POST) {
    const arePinataAuthCredentialsValid = await pinata.testAuthentication();
    if (!arePinataAuthCredentialsValid.authenticated) {
      return response.status(401).json({ error: "Pinata IPFS service authentication credentials are invalid." });
    }
    const { metadata, fileName }: RequestBody = request.body;
    try {
      if (metadata === "" || metadata === undefined) {
        return response.status(400).json({ error: "Metadata cannot be empty." });
      }
      if (fileName === "" || fileName === undefined) {
        return response.status(400).json({ error: "File name cannot be empty." });
      }
      const pinataResponse = await pinMarkdownToIPFS(metadata, fileName);
      return response.status(200).json(pinataResponse);
    } catch (error) {
      return response.status(502).json({ error: "Failed to pin data to IPFS." });
    }
  }
}
