import { Box, chakra, Text } from "@chakra-ui/react";
import ReactPaginate from "react-paginate";
import { PaginationStyles } from "./PaginationStyles";

interface PaginationProps {
  pageCount: number;
  isPaginationVisible: boolean;
  isPreviousButtonVisible: boolean;
  isNextButtonVisible: boolean;
  customPaginationStyles?: React.CSSProperties;
  handlePageClick: ({ selected }: { selected: number }) => void;
}

function PaginationBase(props: PaginationProps) {
  if (!props.isPaginationVisible) {
    return <></>;
  }

  return (
    <Box sx={{ ...PaginationStyles, ...props.customPaginationStyles }}>
      <ReactPaginate
        containerClassName="pagination"
        pageLinkClassName="pagination__page-link"
        previousLinkClassName="pagination__page-link"
        nextLinkClassName="pagination__page-link"
        activeClassName="pagination__page-item--active"
        activeLinkClassName="pagination__page-link--active"
        breakLabel="..."
        nextLabel={props.isPreviousButtonVisible ? <Text textStyle="h3">Next</Text> : <></>}
        previousLabel={props.isNextButtonVisible ? <Text textStyle="h3">Previous</Text> : <></>}
        onPageChange={props.handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        pageCount={props.pageCount}
        renderOnZeroPageCount={undefined}
      />
    </Box>
  );
}

const Pagination = chakra(PaginationBase);

export { Pagination };
