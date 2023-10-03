export function isCIDValid(CID: string) {
  const CIDRegex = /^[a-zA-Z0-9]+$/;
  if (typeof CID === "string" && CID.length === 46 && CID.startsWith("Qm") && CIDRegex.test(CID)) {
    return true;
  }
  return false;
}
