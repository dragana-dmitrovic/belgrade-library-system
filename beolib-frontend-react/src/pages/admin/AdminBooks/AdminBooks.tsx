import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { createBook, deleteBook, getBooksPaged, updateBook } from '../../../api/bookApi';
import { BookCover } from '../../../components/BookCover/BookCover';
import { BookPagination } from '../../../components/BookPagination/BookPagination';
import type { Book, BookCreateRequest, BookUpdateRequest } from '../../../models/book.model';
import type { BookGenre } from '../../../models/enums.model';
import { getApiErrorMessage } from '../../../utils/api-error.util';
import { formatGenre, getGenreOptions } from '../../../utils/genre.util';
import { AddBookWizard } from './AddBookWizard';
import './AddBookWizard.css';
import './AdminBooks.css';

type FormMode = 'create' | 'edit' | null;

interface BookFormState {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  genre: BookGenre | '';
  description: string;
  coverImageUrl: string;
  totalCopies: number;
  availableCopies: number;
}

const EMPTY_FORM: BookFormState = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  description: '',
  coverImageUrl: '',
  totalCopies: 1,
  availableCopies: 1,
};

function bookToForm(book: Book): BookFormState {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    genre: (book.genre as BookGenre) || '',
    description: book.description ?? '',
    coverImageUrl: book.coverImageUrl ?? '',
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies,
  };
}

function validateForm(form: BookFormState): string | null {
  if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.genre) {
    return 'Popunite sva obavezna polja (naslov, autor, ISBN, žanr).';
  }
  if (form.totalCopies < 0 || form.availableCopies < 0) {
    return 'Broj primeraka ne može biti negativan.';
  }
  if (form.availableCopies > form.totalCopies) {
    return 'Dostupni primeraci ne mogu biti veći od ukupnog broja.';
  }
  return null;
}

function toCreateRequest(form: BookFormState): BookCreateRequest {
  return {
    title: form.title.trim(),
    authorName: form.author.trim(),
    isbn: form.isbn.trim(),
    genre: form.genre,
    description: form.description.trim() || undefined,
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    totalCopies: form.totalCopies,
    availableCopies: form.availableCopies,
  };
}

function toUpdateRequest(form: BookFormState): BookUpdateRequest {
  return {
    id: form.id!,
    ...toCreateRequest(form),
  };
}

const ADMIN_PAGE_SIZE = 20;

export function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [form, setForm] = useState<BookFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const loadBooks = useCallback(async (pageToLoad: number, search: string) => {
    setLoading(true);
    setErrorMessage(null);

    const trimmedSearch = search.trim();

    try {
      const data = await getBooksPaged({
        page: pageToLoad,
        size: ADMIN_PAGE_SIZE,
        sortBy: 'title',
        sortDirection: 'asc',
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
      });
      setBooks(data.values);
      setPage(data.page);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (error) {
      setBooks([]);
      setTotalElements(0);
      setTotalPages(0);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadBooks(page, debouncedSearch);
  }, [page, debouncedSearch, loadBooks]);

  function handleClearSearch() {
    setSearchInput('');
    setDebouncedSearch('');
    setPage(0);
  }

  const hasActiveSearch = debouncedSearch.trim().length > 0;

  function openCreateForm() {
    setWizardOpen(false);
    setFormMode('create');
    setForm(EMPTY_FORM);
    setFormError(null);
    setSuccessMessage(null);
  }

  function openWizard() {
    setFormMode(null);
    setWizardOpen(true);
    setFormError(null);
    setSuccessMessage(null);
  }

  function closeWizard() {
    setWizardOpen(false);
  }

  function openEditForm(book: Book) {
    setWizardOpen(false);
    setFormMode('edit');
    setForm(bookToForm(book));
    setFormError(null);
    setSuccessMessage(null);
  }

  function closeForm() {
    setFormMode(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function handleWizardSuccess(message: string) {
    setWizardOpen(false);
    setSuccessMessage(message);
    void loadBooks(page, debouncedSearch);
  }

  function updateFormField<K extends keyof BookFormState>(field: K, value: BookFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (formMode === 'create') {
        await createBook(toCreateRequest(form));
        setSuccessMessage('Knjiga je uspešno dodata.');
      } else if (formMode === 'edit') {
        await updateBook(toUpdateRequest(form));
        setSuccessMessage('Knjiga je uspešno izmenjena.');
      }

      closeForm();
      await loadBooks(page, debouncedSearch);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(book: Book) {
    const confirmed = window.confirm(
      `Da li želiš da obrišeš knjigu "${book.title}"? Ova akcija se ne može poništiti.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(book.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const wasLastOnPage = books.length === 1;
      await deleteBook(book.id);
      setSuccessMessage('Knjiga je uspešno obrisana.');
      if (formMode === 'edit' && form.id === book.id) {
        closeForm();
      }
      if (wasLastOnPage && page > 0) {
        setPage((current) => current - 1);
      } else {
        await loadBooks(page, debouncedSearch);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1>Knjige</h1>
        <div className="page-header-actions">
          <button type="button" className="primary-button" onClick={openWizard}>
            Dodaj preko ISBN-a
          </button>
          <button type="button" className="secondary-button" onClick={openCreateForm}>
            Ručni unos
          </button>
        </div>
      </div>

      {successMessage && (
        <p className="message success page-feedback">{successMessage}</p>
      )}
      {errorMessage && <p className="message error page-feedback">{errorMessage}</p>}

      {wizardOpen && (
        <AddBookWizard onClose={closeWizard} onSuccess={handleWizardSuccess} />
      )}

      {formMode && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{formMode === 'create' ? 'Nova knjiga' : 'Izmena knjige'}</h2>

          <div className="admin-form-grid">
            <label>
              Naslov *
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateFormField('title', event.target.value)}
                maxLength={255}
                required
              />
            </label>

            <label>
              Autor *
              <input
                type="text"
                value={form.author}
                onChange={(event) => updateFormField('author', event.target.value)}
                maxLength={255}
                required
              />
            </label>

            <label>
              ISBN *
              <input
                type="text"
                value={form.isbn}
                onChange={(event) => updateFormField('isbn', event.target.value)}
                maxLength={32}
                required
              />
            </label>

            <label>
              Žanr *
              <select
                value={form.genre}
                onChange={(event) =>
                  updateFormField('genre', event.target.value as BookGenre | '')
                }
                required
              >
                <option value="">Izaberi žanr</option>
                {getGenreOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Ukupno primeraka *
              <input
                type="number"
                min={0}
                value={form.totalCopies}
                onChange={(event) =>
                  updateFormField('totalCopies', Number(event.target.value))
                }
                required
              />
            </label>

            <label>
              Dostupno primeraka *
              <input
                type="number"
                min={0}
                value={form.availableCopies}
                onChange={(event) =>
                  updateFormField('availableCopies', Number(event.target.value))
                }
                required
              />
            </label>

            <label className="full-width">
              URL slike korica (opciono)
              <input
                type="text"
                value={form.coverImageUrl}
                onChange={(event) => updateFormField('coverImageUrl', event.target.value)}
                maxLength={1024}
                placeholder="/book-covers/naziv.jpg ili https://..."
              />
            </label>

            <label className="full-width">
              Opis (opciono)
              <textarea
                value={form.description}
                onChange={(event) => updateFormField('description', event.target.value)}
              />
            </label>
          </div>

          {formError && <p className="message error">{formError}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Čuvanje...' : formMode === 'create' ? 'Dodaj knjigu' : 'Sačuvaj izmene'}
            </button>
            <button type="button" className="secondary-button" onClick={closeForm} disabled={submitting}>
              Otkaži
            </button>
          </div>
        </form>
      )}

      <div className="admin-books-toolbar">
        <label className="admin-books-search">
          Pretraga
          <div className="admin-books-search-row">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Pretraži po naslovu, autoru ili ISBN-u..."
            />
            {searchInput && (
              <button type="button" className="secondary-button" onClick={handleClearSearch}>
                Obriši
              </button>
            )}
          </div>
        </label>
      </div>

      {loading && books.length === 0 ? (
        <p className="loading-state">Učitavanje knjiga...</p>
      ) : books.length === 0 ? (
        <div className="empty-state">
          {hasActiveSearch
            ? 'Nema knjiga koje odgovaraju pretrazi.'
            : 'Nema knjiga u katalogu.'}
        </div>
      ) : (
        <>
          <div className={`data-table-wrap${loading ? ' data-table-wrap-loading' : ''}`}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Korica</th>
                  <th>Naslov</th>
                  <th>Autor</th>
                  <th>ISBN</th>
                  <th>Žanr</th>
                  <th>Dostupnost</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <BookCover
                        coverImageUrl={book.coverImageUrl}
                        title={book.title}
                        author={book.author}
                        imageClassName="admin-book-cover-thumb"
                        fallbackClassName="admin-book-cover-fallback"
                      />
                    </td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{formatGenre(book.genre)}</td>
                    <td>
                      {book.availableCopies} / {book.totalCopies}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditForm(book)}
                        >
                          Izmeni
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          disabled={deletingId === book.id}
                          onClick={() => void handleDelete(book)}
                        >
                          {deletingId === book.id ? 'Brisanje...' : 'Obriši'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p className="loading-state admin-books-loading">Učitavanje knjiga...</p>}
          <BookPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            loading={loading}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </>
      )}
    </div>
  );
}
