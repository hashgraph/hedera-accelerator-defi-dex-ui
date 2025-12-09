import { Box, chakra } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
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
        previousLinkClassName="pagination__nav-link"
        nextLinkClassName="pagination__nav-link"
        disabledClassName="pagination__nav--disabled"
        activeClassName="pagination__page-item--active"
        activeLinkClassName="pagination__page-link--active"
        breakLabel="..."
        breakClassName="pagination__break"
        nextLabel={<ChevronRightIcon boxSize={5} />}
        previousLabel={<ChevronLeftIcon boxSize={5} />}
        onPageChange={props.handlePageClick}
        pageRangeDisplayed={5}
        marginPagesDisplayed={1}
        pageCount={props.pageCount}
        renderOnZeroPageCount={undefined}
      />
    </Box>
  );
}

const Pagination = chakra(PaginationBase);

export { Pagination };
