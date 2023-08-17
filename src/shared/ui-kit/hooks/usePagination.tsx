import { useState } from "react";

interface UsePaginationProps<T> {
  data: T[];
  initialPage?: number;
  pageLimit: number;
}

export function usePagination<T>({ data, initialPage = 0, pageLimit }: UsePaginationProps<T>) {
  const [page, setPage] = useState(initialPage);
  const pageCount = Math.ceil((data?.length ?? 0) / pageLimit);
  const isPaginationVisible = pageCount - 1 > 0;
  const isPreviousButtonVisible = page < pageCount - 1;
  const isNextButtonVisible = page > 0;
  const paginatedData = getDataForPage(data);

  function getDataForPage(formattedProposals: T[]) {
    const from = page * pageLimit;
    const to = (page + 1) * pageLimit;
    return formattedProposals.slice(from, to);
  }

  function handlePageClick({ selected }: { selected: number }) {
    setPage(selected);
  }

  return {
    paginatedData,
    pageCount,
    handlePageClick,
    isPaginationVisible,
    isPreviousButtonVisible,
    isNextButtonVisible,
  };
}
