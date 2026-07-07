import { useCallback, useEffect, useState } from 'react';



import { getBooksPaged } from '../../api/bookApi';

import { getAllBranches } from '../../api/branchApi';

import { BookCard } from '../../components/BookCard/BookCard';

import { BookPagination } from '../../components/BookPagination/BookPagination';

import { ScrollReveal } from '../../components/ScrollReveal/ScrollReveal';

import type { Book, BookPagedParams, BookSearchParams } from '../../models/book.model';

import type { Branch } from '../../models/branch.model';

import { getApiErrorMessage } from '../../utils/api-error.util';

import { getGenreOptions } from '../../utils/genre.util';

import './Books.css';



const PAGE_SIZE = 24;

const DEFAULT_SORT = { sortBy: 'title', sortDirection: 'asc' as const };



function buildSearchParams(

  search: string,

  genre: string,

  branchId: string,

  availableOnly: boolean,

): BookSearchParams {

  const params: BookSearchParams = {};



  if (search.trim()) {

    params.search = search.trim();

  }

  if (genre) {

    params.genre = genre;

  }

  if (branchId) {

    params.branchId = Number(branchId);

  }

  if (availableOnly) {

    params.available = true;

  }



  return params;

}



export function BooksPage() {

  const [books, setBooks] = useState<Book[]>([]);

  const [page, setPage] = useState(0);

  const [totalElements, setTotalElements] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);



  const [branches, setBranches] = useState<Branch[]>([]);

  const [branchesLoading, setBranchesLoading] = useState(true);



  const [searchInput, setSearchInput] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [genreInput, setGenreInput] = useState('');

  const [branchInput, setBranchInput] = useState('');

  const [availableOnlyInput, setAvailableOnlyInput] = useState(false);



  const appliedParams = buildSearchParams(

    debouncedSearch,

    genreInput,

    branchInput,

    availableOnlyInput,

  );

  const branchFilterActive = appliedParams.branchId != null;



  const loadBooks = useCallback(async (pageToLoad: number, params: BookSearchParams) => {

    setLoading(true);

    setErrorMessage(null);



    const request: BookPagedParams = {

      ...params,

      page: pageToLoad,

      size: PAGE_SIZE,

      ...DEFAULT_SORT,

    };



    try {

      const data = await getBooksPaged(request);

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

    async function loadBranches() {

      setBranchesLoading(true);

      try {

        const data = await getAllBranches();

        setBranches(data);

      } catch {

        setBranches([]);

      } finally {

        setBranchesLoading(false);

      }

    }



    void loadBranches();

  }, []);



  useEffect(() => {

    const timer = window.setTimeout(() => {

      setDebouncedSearch(searchInput);

      setPage(0);

    }, 300);



    return () => window.clearTimeout(timer);

  }, [searchInput]);



  useEffect(() => {
    const params = buildSearchParams(
      debouncedSearch,
      genreInput,
      branchInput,
      availableOnlyInput,
    );
    void loadBooks(page, params);
  }, [page, debouncedSearch, genreInput, branchInput, availableOnlyInput, loadBooks]);



  function handleGenreChange(value: string) {

    setGenreInput(value);

    setPage(0);

  }



  function handleBranchChange(value: string) {

    setBranchInput(value);

    setPage(0);

  }



  function handleAvailableChange(checked: boolean) {

    setAvailableOnlyInput(checked);

    setPage(0);

  }



  function handleResetFilters() {

    setSearchInput('');

    setDebouncedSearch('');

    setGenreInput('');

    setBranchInput('');

    setAvailableOnlyInput(false);

    setPage(0);

  }



  const hasActiveFilters =

    !!appliedParams.search ||

    !!appliedParams.genre ||

    appliedParams.branchId != null ||

    appliedParams.available === true;



  const resultsLabel =

    !loading && totalElements > 0

      ? `${totalElements} ${totalElements === 1 ? 'naslov' : 'naslova'}`

      : null;



  return (

    <div className="page-shell books-catalog-page">

      <ScrollReveal>

        <div className="books-catalog-banner">

          <header className="books-catalog-header">

            <div>

              <p className="eyebrow">Katalog</p>

              <h1>Katalog knjiga</h1>

              <p className="books-catalog-lead page-lead">

                Pretražite fond biblioteke, filtrirajte po filijali i otvorite detalje naslova.

              </p>

            </div>

            {resultsLabel && <p className="books-results-count">{resultsLabel}</p>}

          </header>

        </div>

      </ScrollReveal>



      <ScrollReveal delay={80}>

        <form

          className="books-filters luxury-card"

          onSubmit={(event) => event.preventDefault()}

        >

          <label>

            Pretraga

            <input

              type="text"

              value={searchInput}

              onChange={(event) => setSearchInput(event.target.value)}

              placeholder="Naslov ili autor..."

            />

          </label>



          <label>

            Žanr

            <select

              value={genreInput}

              onChange={(event) => handleGenreChange(event.target.value)}

            >

              <option value="">Svi žanrovi</option>

              {getGenreOptions().map((option) => (

                <option key={option.value} value={option.value}>

                  {option.label}

                </option>

              ))}

            </select>

          </label>



          <label>

            Filijala

            <select

              value={branchInput}

              onChange={(event) => handleBranchChange(event.target.value)}

              disabled={branchesLoading}

            >

              <option value="">Sve filijale</option>

              {branches.map((branch) => (

                <option key={branch.id} value={branch.id}>

                  {branch.name}

                </option>

              ))}

            </select>

          </label>



          <label className="checkbox-label">

            <input

              type="checkbox"

              checked={availableOnlyInput}

              onChange={(event) => handleAvailableChange(event.target.checked)}

            />

            Samo dostupne

          </label>



          <div className="filter-actions">

            <button type="button" className="ghost-button" onClick={handleResetFilters}>

              Resetuj

            </button>

          </div>

        </form>

      </ScrollReveal>



      {errorMessage && <p className="message error">{errorMessage}</p>}



      {loading && books.length === 0 ? (

        <p className="loading-state">Učitavanje knjiga...</p>

      ) : books.length === 0 ? (

        <div className="empty-state">

          {hasActiveFilters

            ? 'Nema knjiga koje odgovaraju pretrazi.'

            : 'Nema knjiga u katalogu.'}

        </div>

      ) : (

        <>

          <div className={`book-card-grid${loading ? ' book-card-grid-loading' : ''}`}>

            {books.map((book, index) => (

              <ScrollReveal key={book.id} delay={(index % 4) * 70}>

                <BookCard book={book} branchFilterActive={branchFilterActive} />

              </ScrollReveal>

            ))}

          </div>

          {loading && <p className="loading-state books-page-loading">Učitavanje knjiga...</p>}

        </>

      )}



      <BookPagination

        page={page}

        totalPages={totalPages}

        totalElements={totalElements}

        loading={loading}

        onPrevious={() => setPage((current) => Math.max(0, current - 1))}

        onNext={() => setPage((current) => current + 1)}

      />

    </div>

  );

}


