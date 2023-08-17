import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

/**
 * Props for DataTable component.
 * The key in the rowData objects should match exactly the corresponding
 * column header, as there is logic to match cell data to the appropriate
 * corresponding column
 */
export interface DataTableProps {
  colHeaders: DataTableColumnConfig[];
  rowData: { [key: string]: any }[];
}

export interface DataTableColumnConfig {
  headerName: string;
  field?: string;
  colWidth: number;
}

const DataTable = (props: DataTableProps) => {
  return (
    <TableContainer>
      <Table variant={"unstyled"}>
        <Thead>
          <Tr backgroundColor={"#808080"}>
            {props.colHeaders.map((colHeader, i) => (
              <Th color={"white"} borderRight={"1px solid #B1B1B1"} padding={"6px"} whiteSpace={"initial"} key={i}>
                {colHeader.headerName}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {props.rowData?.map((row, i) => (
            <Tr borderBottom={"1px solid #B1B1B1"} key={i}>
              {props.colHeaders.map((colConfig, i) => (
                <Td
                  width={`${colConfig.colWidth}px`}
                  padding={"6px"}
                  borderRight={i === props.colHeaders.length - 1 ? "none" : "1px solid #B1B1B1"}
                  key={i}
                >
                  {colConfig?.field && row[colConfig.field] ? row[colConfig.field] : "-"}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export { DataTable };
