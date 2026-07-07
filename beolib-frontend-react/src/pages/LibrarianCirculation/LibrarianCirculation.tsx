import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { getAllBooks, getBranchAvailabilityForBook } from '../../api/bookApi';
import {
  createDirectLoan,
  expireOverdueReservations,
  getActiveReservations,
  getLoans,
  issueReservation,
  returnLoan,
} from '../../api/circulationApi';
import { ScrollReveal } from '../../components/ScrollReveal/ScrollReveal';
import type { Book } from '../../models/book.model';
import type { BookBranchAvailability } from '../../models/book-branch-availability.model';
import type { ActiveReservation, Loan } from '../../models/circulation.model';
import { getApiErrorMessage } from '../../utils/api-error.util';
import { formatDate, formatDateTime } from '../../utils/date.util';
import {
  getLoanDisplayStatus,
  loanStatusPillClassForLoan,
} from '../../utils/loan-status.util';
import {
  formatReservationStatus,
  reservationStatusPillClass,
} from '../../utils/reservation-status.util';
import './LibrarianCirculation.css';

interface DirectLoanForm {
  memberEmail: string;
  bookId: string;
  branchId: string;
  notes: string;
}

const EMPTY_DIRECT_LOAN_FORM: DirectLoanForm = {
  memberEmail: '',
  bookId: '',
  branchId: '',
  notes: '',
};

function getAvailableBranches(
  availability: BookBranchAvailability[],
): BookBranchAvailability[] {
  return availability.filter((branch) => branch.availableCopies > 0);
}

function matchesCirculationSearch(
  query: string,
  memberName: string,
  bookTitle: string,
  copyCode?: string | null,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return [memberName, bookTitle, copyCode ?? '']
    .some((value) => value.toLowerCase().includes(normalized));
}

function getFilteredEmptyMessage(
  hasSearch: boolean,
  hasUnfilteredItems: boolean,
  defaultMessage: string,
): string {
  if (hasSearch && hasUnfilteredItems) {
    return 'Nema rezultata za unetu pretragu.';
  }
  return defaultMessage;
}

export function LibrarianCirculationPage() {
  const [activeReservations, setActiveReservations] = useState<ActiveReservation[]>([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [issuingId, setIssuingId] = useState<number | null>(null);
  const [expiring, setExpiring] = useState(false);

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [loansError, setLoansError] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState('');

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [directLoanForm, setDirectLoanForm] = useState<DirectLoanForm>(EMPTY_DIRECT_LOAN_FORM);
  const [branchAvailability, setBranchAvailability] = useState<BookBranchAvailability[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [directLoanSubmitting, setDirectLoanSubmitting] = useState(false);
  const [directLoanError, setDirectLoanError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableBranches = getAvailableBranches(branchAvailability);
  const hasSearch = searchInput.trim().length > 0;

  const loadActiveReservations = useCallback(async () => {
    setActiveLoading(true);
    setActiveError(null);
    try {
      const data = await getActiveReservations();
      setActiveReservations(data);
    } catch (error) {
      setActiveReservations([]);
      setActiveError(getApiErrorMessage(error));
    } finally {
      setActiveLoading(false);
    }
  }, []);

  const loadLoans = useCallback(async () => {
    setLoansLoading(true);
    setLoansError(null);
    try {
      const data = await getLoans({});
      setLoans(data);
    } catch (error) {
      setLoans([]);
      setLoansError(getApiErrorMessage(error));
    } finally {
      setLoansLoading(false);
    }
  }, []);

  const loadBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const data = await getAllBooks();
      setBooks(data);
    } catch {
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActiveReservations();
    void loadLoans();
    void loadBooks();
  }, [loadActiveReservations, loadLoans, loadBooks]);

  useEffect(() => {
    const bookId = Number(directLoanForm.bookId);
    if (!Number.isFinite(bookId) || bookId <= 0) {
      setBranchAvailability([]);
      setDirectLoanForm((current) => ({ ...current, branchId: '' }));
      return;
    }

    async function loadBranches() {
      setBranchesLoading(true);
      setDirectLoanError(null);
      try {
        const data = await getBranchAvailabilityForBook(bookId);
        setBranchAvailability(data);
        const available = getAvailableBranches(data);
        setDirectLoanForm((current) => {
          const stillValid = available.some(
            (branch) => String(branch.branchId) === current.branchId,
          );
          return {
            ...current,
            branchId: stillValid ? current.branchId : available[0] ? String(available[0].branchId) : '',
          };
        });
      } catch (error) {
        setBranchAvailability([]);
        setDirectLoanError(getApiErrorMessage(error));
      } finally {
        setBranchesLoading(false);
      }
    }

    void loadBranches();
  }, [directLoanForm.bookId]);

  const allActiveLoans = useMemo(
    () => loans.filter((loan) => loan.status === 'ACTIVE'),
    [loans],
  );
  const allReturnedLoans = useMemo(
    () => loans.filter((loan) => loan.status === 'RETURNED'),
    [loans],
  );

  const filteredActiveLoans = useMemo(
    () =>
      allActiveLoans.filter((loan) =>
        matchesCirculationSearch(searchInput, loan.memberFullName, loan.bookTitle, loan.copyCode),
      ),
    [allActiveLoans, searchInput],
  );

  const filteredReturnedLoans = useMemo(
    () =>
      allReturnedLoans.filter((loan) =>
        matchesCirculationSearch(searchInput, loan.memberFullName, loan.bookTitle, loan.copyCode),
      ),
    [allReturnedLoans, searchInput],
  );

  const filteredReservations = useMemo(
    () =>
      activeReservations.filter((reservation) =>
        matchesCirculationSearch(
          searchInput,
          reservation.memberFullName,
          reservation.bookTitle,
          reservation.copyCode,
        ),
      ),
    [activeReservations, searchInput],
  );

  async function refreshAll() {
    await Promise.all([loadActiveReservations(), loadLoans()]);
  }

  async function handleIssue(reservation: ActiveReservation) {
    const confirmed = window.confirm(
      `Da li želiš da izdaš knjigu "${reservation.bookTitle}" članu ${reservation.memberFullName}?`,
    );
    if (!confirmed) {
      return;
    }

    setIssuingId(reservation.reservationId);
    setSuccessMessage(null);
    setActiveError(null);

    try {
      await issueReservation(reservation.reservationId);
      setSuccessMessage(`Knjiga "${reservation.bookTitle}" je uspešno izdata.`);
      await refreshAll();
    } catch (error) {
      setActiveError(getApiErrorMessage(error));
    } finally {
      setIssuingId(null);
    }
  }

  async function handleExpireOverdue() {
    setExpiring(true);
    setSuccessMessage(null);
    setActiveError(null);

    try {
      const result = await expireOverdueReservations();
      setSuccessMessage(`Broj isteklih rezervacija: ${result.expiredCount}`);
      await refreshAll();
    } catch (error) {
      setActiveError(getApiErrorMessage(error));
    } finally {
      setExpiring(false);
    }
  }

  async function handleDirectLoanSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDirectLoanError(null);
    setSuccessMessage(null);

    const email = directLoanForm.memberEmail.trim();
    const bookId = Number(directLoanForm.bookId);
    const branchId = Number(directLoanForm.branchId);

    if (!email) {
      setDirectLoanError('Unesite email člana.');
      return;
    }
    if (!Number.isFinite(bookId) || bookId <= 0) {
      setDirectLoanError('Izaberite knjigu.');
      return;
    }
    if (!Number.isFinite(branchId) || branchId <= 0) {
      setDirectLoanError('Izaberite filijalu sa dostupnim primercima.');
      return;
    }

    const selectedBranch = availableBranches.find(
      (branch) => branch.branchId === branchId,
    );

    if (!selectedBranch || selectedBranch.availableCopies <= 0) {
      setDirectLoanError('Izabrana filijala nema dostupnih primeraka.');
      return;
    }

    if (availableBranches.length === 0) {
      setDirectLoanError('Nema dostupnih primeraka u izabranoj filijali.');
      return;
    }

    setDirectLoanSubmitting(true);
    try {
      await createDirectLoan({
        memberEmail: email,
        bookId,
        branchId,
        notes: directLoanForm.notes.trim() || undefined,
      });
      setSuccessMessage('Direktna pozajmica je uspešno kreirana.');
      setDirectLoanForm(EMPTY_DIRECT_LOAN_FORM);
      setBranchAvailability([]);
      await refreshAll();
    } catch (error) {
      setDirectLoanError(getApiErrorMessage(error));
    } finally {
      setDirectLoanSubmitting(false);
    }
  }

  async function handleReturn(loan: Loan) {
    const confirmed = window.confirm(
      `Da li želiš da primiš nazad knjigu "${loan.bookTitle}" od ${loan.memberFullName}?`,
    );
    if (!confirmed) {
      return;
    }

    setReturningId(loan.id);
    setSuccessMessage(null);
    setLoansError(null);

    try {
      await returnLoan(loan.id);
      setSuccessMessage(`Knjiga "${loan.bookTitle}" je uspešno vraćena.`);
      await refreshAll();
    } catch (error) {
      setLoansError(getApiErrorMessage(error));
    } finally {
      setReturningId(null);
    }
  }

  function handleClearSearch() {
    setSearchInput('');
  }

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="page-shell circulation-page">
      <ScrollReveal>
        <p className="eyebrow">Bibliotekarski panel</p>
        <h1>Upravljanje aktivnim rezervacijama, direktnim pozajmicama i povratkom knjiga</h1>
        <nav className="circulation-section-nav" aria-label="Brza navigacija po sekcijama">
          <button
            type="button"
            className="secondary-button"
            onClick={() => scrollToSection('aktivne-pozajmice')}
          >
            Aktivne pozajmice
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => scrollToSection('aktivne-rezervacije')}
          >
            Aktivne rezervacije
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => scrollToSection('istorija-pozajmica')}
          >
            Istorija pozajmica
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => scrollToSection('direktna-pozajmica')}
          >
            Kreiraj direktnu pozajmicu
          </button>
        </nav>
      </ScrollReveal>

      {successMessage && <p className="message success page-feedback">{successMessage}</p>}

      <ScrollReveal delay={60}>
        <section className="circulation-summary" aria-label="Pregled cirkulacije">
          <article className="circulation-summary-card">
            <p className="circulation-summary-label">Aktivne pozajmice</p>
            <p className="circulation-summary-value">{allActiveLoans.length}</p>
          </article>
          <article className="circulation-summary-card">
            <p className="circulation-summary-label">Aktivne rezervacije</p>
            <p className="circulation-summary-value">{activeReservations.length}</p>
          </article>
          <article className="circulation-summary-card">
            <p className="circulation-summary-label">Ukupno pozajmica</p>
            <p className="circulation-summary-value">{loans.length}</p>
          </article>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={90}>
        <div className="circulation-toolbar">
          <label className="circulation-search">
            Pretraga
            <div className="circulation-search-row">
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Pretraži po članu, knjizi ili kodu primerka..."
              />
              {searchInput && (
                <button type="button" className="secondary-button" onClick={handleClearSearch}>
                  Obriši
                </button>
              )}
            </div>
          </label>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={120}>
        <section id="aktivne-pozajmice" className="circulation-section">
          <div className="circulation-section-header">
            <div>
              <h2>Aktivne pozajmice</h2>
              <p className="circulation-section-lead">
                {hasSearch
                  ? `Prikazano ${filteredActiveLoans.length} od ${allActiveLoans.length}`
                  : `${allActiveLoans.length} aktivnih pozajmica`}
              </p>
            </div>
          </div>

          {loansError && <p className="message error page-feedback">{loansError}</p>}

          {loansLoading && filteredActiveLoans.length === 0 ? (
            <p className="loading-state">Učitavanje pozajmica...</p>
          ) : filteredActiveLoans.length === 0 ? (
            <div className="empty-state">
              {getFilteredEmptyMessage(hasSearch, allActiveLoans.length > 0, 'Nema aktivnih pozajmica.')}
            </div>
          ) : (
            <div className={`data-table-wrap${loansLoading ? ' circulation-table-loading' : ''}`}>
              <table className="data-table circulation-table">
                <thead>
                  <tr>
                    <th>Član</th>
                    <th>Knjiga</th>
                    <th>Primerak</th>
                    <th>Datum pozajmice</th>
                    <th>Rok vraćanja</th>
                    <th>Status</th>
                    <th className="table-actions-col">Akcija</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <span className="circulation-primary-text">{loan.memberFullName}</span>
                        <span className="circulation-secondary-text">{loan.memberEmail}</span>
                      </td>
                      <td>
                        <span className="circulation-primary-text">{loan.bookTitle}</span>
                        <span className="circulation-secondary-text">{loan.branchName}</span>
                      </td>
                      <td>
                        <code className="copy-code">{loan.copyCode}</code>
                      </td>
                      <td>{formatDateTime(loan.loanDate)}</td>
                      <td>{formatDate(loan.dueDate)}</td>
                      <td>
                        <span className={loanStatusPillClassForLoan(loan.status, loan.dueDate)}>
                          {getLoanDisplayStatus(loan.status, loan.dueDate)}
                        </span>
                      </td>
                      <td className="table-actions-col">
                        <button
                          type="button"
                          className="action-button"
                          disabled={returningId === loan.id}
                          onClick={() => void handleReturn(loan)}
                        >
                          {returningId === loan.id ? 'Vraćanje...' : 'Vrati knjigu'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <section id="aktivne-rezervacije" className="circulation-section">
          <div className="circulation-section-header">
            <div>
              <h2>Aktivne rezervacije</h2>
              <p className="circulation-section-lead">
                {hasSearch
                  ? `Prikazano ${filteredReservations.length} od ${activeReservations.length}`
                  : `${activeReservations.length} aktivnih rezervacija`}
              </p>
            </div>
            <div className="section-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={expiring || activeLoading}
                onClick={() => void handleExpireOverdue()}
              >
                {expiring ? 'Obrada...' : 'Obradi istekle rezervacije'}
              </button>
            </div>
          </div>

          {activeError && <p className="message error page-feedback">{activeError}</p>}

          {activeLoading && filteredReservations.length === 0 ? (
            <p className="loading-state">Učitavanje aktivnih rezervacija...</p>
          ) : filteredReservations.length === 0 ? (
            <div className="empty-state">
              {getFilteredEmptyMessage(
                hasSearch,
                activeReservations.length > 0,
                'Nema aktivnih rezervacija.',
              )}
            </div>
          ) : (
            <div className={`data-table-wrap${activeLoading ? ' circulation-table-loading' : ''}`}>
              <table className="data-table circulation-table">
                <thead>
                  <tr>
                    <th>Član</th>
                    <th>Knjiga</th>
                    <th>Filijala</th>
                    <th>Primerak</th>
                    <th>Rezervisano</th>
                    <th>Status</th>
                    <th className="table-actions-col">Akcija</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.reservationId}>
                      <td>
                        <span className="circulation-primary-text">{reservation.memberFullName}</span>
                        <span className="circulation-secondary-text">{reservation.memberEmail}</span>
                      </td>
                      <td>{reservation.bookTitle}</td>
                      <td>{reservation.branchName}</td>
                      <td>
                        {reservation.copyCode ? (
                          <code className="copy-code">{reservation.copyCode}</code>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{formatDateTime(reservation.reservedAt)}</td>
                      <td>
                        <span className={reservationStatusPillClass(reservation.status)}>
                          {formatReservationStatus(reservation.status)}
                        </span>
                      </td>
                      <td className="table-actions-col">
                        <button
                          type="button"
                          className="action-button"
                          disabled={issuingId === reservation.reservationId}
                          onClick={() => void handleIssue(reservation)}
                        >
                          {issuingId === reservation.reservationId ? 'Izdavanje...' : 'Izdaj knjigu'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal delay={180}>
        <section id="istorija-pozajmica" className="circulation-section">
          <div className="circulation-section-header">
            <div>
              <h2>Istorija pozajmica</h2>
              <p className="circulation-section-lead">
                {allReturnedLoans.length === 0
                  ? 'Nema vraćenih pozajmica'
                  : hasSearch
                    ? `Prikazano ${filteredReturnedLoans.length} od ${allReturnedLoans.length}`
                    : `${allReturnedLoans.length} vraćenih pozajmica`}
              </p>
            </div>
          </div>

          {allReturnedLoans.length === 0 ? (
            <div className="empty-state">Nema vraćenih pozajmica.</div>
          ) : filteredReturnedLoans.length === 0 ? (
            <div className="empty-state">
              {getFilteredEmptyMessage(
                hasSearch,
                allReturnedLoans.length > 0,
                'Nema vraćenih pozajmica.',
              )}
            </div>
          ) : (
            <div className={`data-table-wrap${loansLoading ? ' circulation-table-loading' : ''}`}>
              <table className="data-table circulation-table">
                <thead>
                  <tr>
                    <th>Član</th>
                    <th>Knjiga</th>
                    <th>Primerak</th>
                    <th>Izdato</th>
                    <th>Vraćeno</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturnedLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <span className="circulation-primary-text">{loan.memberFullName}</span>
                        <span className="circulation-secondary-text">{loan.memberEmail}</span>
                      </td>
                      <td>{loan.bookTitle}</td>
                      <td>
                        <code className="copy-code">{loan.copyCode}</code>
                      </td>
                      <td>{formatDateTime(loan.loanDate)}</td>
                      <td>{loan.returnedAt ? formatDateTime(loan.returnedAt) : '—'}</td>
                      <td>
                        <span className={loanStatusPillClassForLoan(loan.status, loan.dueDate)}>
                          {getLoanDisplayStatus(loan.status, loan.dueDate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal delay={210}>
        <section id="direktna-pozajmica" className="circulation-section">
          <h2>Direktna pozajmica</h2>
          <p className="reservation-source">
            Rok vraćanja se automatski postavlja na 14 dana od datuma izdavanja.
          </p>

          {directLoanError && <p className="message error page-feedback">{directLoanError}</p>}

          <form className="circulation-form" onSubmit={handleDirectLoanSubmit}>
            <div className="circulation-form-grid">
              <label>
                Email člana
                <input
                  type="email"
                  value={directLoanForm.memberEmail}
                  onChange={(event) =>
                    setDirectLoanForm((current) => ({
                      ...current,
                      memberEmail: event.target.value,
                    }))
                  }
                  required
                  placeholder="npr. user1@beolib.rs"
                />
              </label>

              <label>
                Knjiga
                <select
                  value={directLoanForm.bookId}
                  onChange={(event) =>
                    setDirectLoanForm((current) => ({
                      ...current,
                      bookId: event.target.value,
                      branchId: '',
                    }))
                  }
                  required
                  disabled={booksLoading}
                >
                  <option value="">— Izaberite knjigu —</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Filijala
                <select
                  value={directLoanForm.branchId}
                  onChange={(event) =>
                    setDirectLoanForm((current) => ({ ...current, branchId: event.target.value }))
                  }
                  required
                  disabled={!directLoanForm.bookId || branchesLoading || availableBranches.length === 0}
                >
                  <option value="">
                    {branchesLoading
                      ? 'Učitavanje...'
                      : availableBranches.length === 0
                        ? 'Nema dostupnih filijala'
                        : '— Izaberite filijalu —'}
                  </option>
                  {availableBranches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName} — {branch.availableCopies} dostupno
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Napomena (opciono)
                <textarea
                  value={directLoanForm.notes}
                  onChange={(event) =>
                    setDirectLoanForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  maxLength={1000}
                />
              </label>
            </div>

            <button type="submit" className="primary-button" disabled={directLoanSubmitting}>
              {directLoanSubmitting ? 'Kreiranje...' : 'Kreiraj pozajmicu'}
            </button>
          </form>
        </section>
      </ScrollReveal>
    </div>
  );
}
