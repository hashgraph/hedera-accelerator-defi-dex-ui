export function getDAOLinksRecordArray(links: string[]): Record<"value", string>[] {
  const arrayOfRecords = links.map((linkString) => {
    return { value: linkString };
  });
  return arrayOfRecords;
}
