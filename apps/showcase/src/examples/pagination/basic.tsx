"use client";

import { useState } from "react";
import { Pagination } from "@dethink/components";

export function PaginationBasic() {
  const [page, setPage] = useState(4);

  return (
    <Pagination
      aria-label="Example result pages"
      page={page}
      pageCount={12}
      showFirstLast
      onPageChange={setPage}
    />
  );
}
