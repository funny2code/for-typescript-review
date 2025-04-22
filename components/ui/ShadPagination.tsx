
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@components/shadcn/ui/pagination"
  
  export function ShadPagination(props: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    handlePageChange: (pN: number) => void;
  }) {
    const { currentPage, totalPages, itemsPerPage, setCurrentPage, handlePageChange } = props;
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
                handlePageChange(currentPage - 1);
              }
            }} />
          </PaginationItem>
          {pages.map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(page);
                  handlePageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {/*
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem> */}
          
          <PaginationItem>
            <PaginationNext href="#" onClick={(e) => {
              e.preventDefault();
              if (currentPage + 1 <= totalPages) {
                setCurrentPage(currentPage + 1);
                handlePageChange(currentPage + 1);
              }
            }} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }