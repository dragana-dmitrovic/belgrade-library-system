import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import { BookCover } from '../BookCover/BookCover';
import type { Book } from '../../models/book.model';
import { getBookAvailabilityDisplay } from '../../utils/book-availability.util';
import { formatGenre } from '../../utils/genre.util';
import './BookCard.css';

export interface BookCardProps {
  book: Book;
  branchFilterActive?: boolean;
  showGenre?: boolean;
  detailsLink?: string;
  actions?: ReactNode;
}

export function BookCard({
  book,
  branchFilterActive = false,
  showGenre = true,
  detailsLink,
  actions,
}: BookCardProps) {
  const availability = getBookAvailabilityDisplay(book, branchFilterActive);
  const linkTo = detailsLink ?? `/books/${book.id}`;

  return (
    <article className="book-card">
      <Link to={linkTo} className="book-card-cover-link" aria-label={`Detalji: ${book.title}`}>
        <div className="book-card-cover-wrap">
          <BookCover
            coverImageUrl={book.coverImageUrl}
            isbn={book.isbn}
            title={book.title}
            author={book.author}
            imageClassName="book-card-cover"
          />
        </div>
      </Link>

      <div className="book-card-body">
        <Link to={linkTo} className="book-card-title" title={book.title}>
          {book.title}
        </Link>
        <p className="book-card-author">{book.author}</p>

        {showGenre && book.genre && (
          <span className="book-card-genre">{formatGenre(book.genre)}</span>
        )}

        <p
          className={
            availability.available > 0
              ? 'book-card-availability available'
              : 'book-card-availability unavailable'
          }
        >
          {availability.label}: {availability.available} / {availability.total}
        </p>

        <div className="book-card-footer">
          <Link to={linkTo} className="book-card-details-button">
            Detalji
          </Link>
          {actions}
        </div>
      </div>
    </article>
  );
}
