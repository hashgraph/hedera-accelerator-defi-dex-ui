/**
TODO: In Future SC's PR, team is removing the key value system 
to store links it will be an array rather than string with value and key
*/

export function getDAOLinksRecordArray(links: string): Record<"value", string>[] {
  const array = links.split(",");
  const linksArray = array.map((link, index) => (index % 2 !== 0 ? link : "")).filter((link) => link.length > 0);
  const arrayOfRecords = linksArray.map((linkString) => {
    return { value: linkString };
  });
  return arrayOfRecords;
}
