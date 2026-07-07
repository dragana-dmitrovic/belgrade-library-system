import './BookPagination.css';

interface BookPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  loading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function BookPagination({
  page,
  totalPages,
  totalElements,
  loading = false,
  onPrevious,
  onNext,
}: BookPaginationProps) {
  if (totalPages === 0) {
    return null;
  }

  const displayPage = page + 1;
  const canGoPrevious = page > 0 && !loading;
  const canGoNext = page < totalPages - 1 && !loading;

  return (
    <nav className="book-pagination" aria-label="Paginacija knjiga">
      <p className="book-pagination-summary">
        Ukupno knjiga: <strong>{totalElements}</strong>
      </p>
      <div className="book-pagination-controls">
        <button
          type="button"
          className="secondary-button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          Prethodna
        </button>
        <span className="book-pagination-page-label">
          Strana {displayPage} od {totalPages}
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Sledeća
        </button>
      </div>
    </nav>
  );
}
