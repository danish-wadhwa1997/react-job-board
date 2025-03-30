import { useCallback, useMemo, useState } from "react";

const getStartEndIndex = (
  totalItems: number,
  page: number,
  rowsPerPage: number
) => {
  const endIndex = Math.min(totalItems, page * rowsPerPage)-1;

  const startIndex = Math.max((page - 1) * rowsPerPage, 0);

  return { startIndex, endIndex };
};

const usePagination = (data: any[], rowsPerPage: number) => {
  const totalPages = useMemo(()=>data.length>0 ?Math.ceil(data.length / rowsPerPage):1,[data.length, rowsPerPage]);
  const [page, setPage] = useState<number>(1);

  const increment = useCallback(() => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, []);

  const decrement = useCallback(() => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  }, []);

  return useMemo(
    () => ({
      page,
      increment,
      decrement,
      ...getStartEndIndex(data.length, page, rowsPerPage),
      totalPages
    }),
    [page, increment, decrement, rowsPerPage, data.length, totalPages]
  );
};

export default usePagination;
