import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { searchAuthors } from '../../../api/authorApi';
import { createBookWithInventory, lookupBookByIsbn } from '../../../api/bookApi';
import { getAllBranches } from '../../../api/branchApi';
import type { BookCreateWithInventoryRequest } from '../../../models/book.model';
import type { BookGenre } from '../../../models/enums.model';
import { BOOK_GENRES } from '../../../models/enums.model';
import type { Branch } from '../../../models/branch.model';
import { getApiErrorMessage } from '../../../utils/api-error.util';
import { getGenreOptions } from '../../../utils/genre.util';
import './AddBookWizard.css';

type WizardStep = 1 | 2 | 3;

interface MetadataState {
  title: string;
  authorName: string;
  genre: BookGenre | '';
  description: string;
  coverImageUrl: string;
}

interface AddBookWizardProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const EMPTY_METADATA: MetadataState = {
  title: '',
  authorName: '',
  genre: '',
  description: '',
  coverImageUrl: '',
};

function getLookupErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return 'Knjiga nije pronađena za uneti ISBN';
    }
    if (status === 409) {
      return 'Knjiga sa tim ISBN već postoji u katalogu';
    }
    if (status === 502 || status === 503) {
      return 'Spoljni servis trenutno nedostupan, pokušajte kasnije';
    }
  }
  return getApiErrorMessage(error);
}

function parseGenre(value: string | null | undefined): BookGenre | '' {
  if (!value) {
    return '';
  }
  const normalized = value.trim().toUpperCase();
  if ((BOOK_GENRES as string[]).includes(normalized)) {
    return normalized as BookGenre;
  }
  return 'OTHER';
}

export function AddBookWizard({ onClose, onSuccess }: AddBookWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [isbn, setIsbn] = useState('');
  const [metadata, setMetadata] = useState<MetadataState>(EMPTY_METADATA);
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchCopies, setBranchCopies] = useState<Record<number, number>>({});
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const totalCopies = useMemo(
    () => Object.values(branchCopies).reduce((sum, count) => sum + (count || 0), 0),
    [branchCopies],
  );

  const loadBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const data = await getAllBranches();
      setBranches(data);
      setBranchCopies((current) => {
        const next: Record<number, number> = {};
        for (const branch of data) {
          next[branch.id] = current[branch.id] ?? 0;
        }
        return next;
      });
    } catch (error) {
      setStepError(getApiErrorMessage(error));
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 3 && branches.length === 0 && !branchesLoading) {
      void loadBranches();
    }
  }, [step, branches.length, branchesLoading, loadBranches]);

  useEffect(() => {
    const query = metadata.authorName.trim();
    if (query.length < 2) {
      setAuthorSuggestions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void searchAuthors(query)
        .then(setAuthorSuggestions)
        .catch(() => setAuthorSuggestions([]));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [metadata.authorName]);

  function updateMetadata<K extends keyof MetadataState>(field: K, value: MetadataState[K]) {
    setMetadata((current) => ({ ...current, [field]: value }));
  }

  async function handleIsbnSearch() {
    const trimmed = isbn.trim();
    if (!trimmed) {
      setStepError('Unesite ISBN.');
      return;
    }

    setLookupLoading(true);
    setStepError(null);
    setMetadata(EMPTY_METADATA);

    try {
      const result = await lookupBookByIsbn(trimmed);
      setIsbn(result.isbn);
      setMetadata({
        title: result.title ?? '',
        authorName: result.authorName ?? '',
        genre: parseGenre(result.genre),
        description: result.description ?? '',
        coverImageUrl: result.coverImageUrl ?? '',
      });
      setStep(2);
    } catch (error) {
      setStepError(getLookupErrorMessage(error));
    } finally {
      setLookupLoading(false);
    }
  }

  function handleStep2Next() {
    if (!metadata.title.trim() || !metadata.authorName.trim()) {
      setStepError('Naslov i autor su obavezni.');
      return;
    }
    if (!metadata.genre) {
      setStepError('Izaberite žanr.');
      return;
    }
    setStepError(null);
    setStep(3);
  }

  function handleBackToStep1() {
    setStep(1);
    setStepError(null);
    setMetadata(EMPTY_METADATA);
  }

  async function handleSubmit() {
    if (totalCopies <= 0) {
      setStepError('Ukupan broj primeraka mora biti veći od 0.');
      return;
    }

    const request: BookCreateWithInventoryRequest = {
      isbn: isbn.trim(),
      title: metadata.title.trim(),
      authorName: metadata.authorName.trim(),
      genre: metadata.genre,
      description: metadata.description.trim() || undefined,
      coverImageUrl: metadata.coverImageUrl.trim() || null,
      branchAllocations: branches.map((branch) => ({
        branchId: branch.id,
        copyCount: branchCopies[branch.id] ?? 0,
      })),
    };

    setSubmitLoading(true);
    setStepError(null);

    try {
      const created = await createBookWithInventory(request);
      onSuccess(`Knjiga "${created.title}" je uspešno dodata u katalog.`);
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setStep(1);
        setStepError('Knjiga sa tim ISBN već postoji u katalogu');
        return;
      }
      setStepError(getApiErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  }

  const coverUrl = metadata.coverImageUrl.trim();
  const hasCover = Boolean(coverUrl);

  return (
    <section className="admin-form add-book-wizard" aria-label="Dodavanje knjige preko ISBN-a">
      <div className="wizard-header">
        <h2>Dodaj knjigu preko ISBN-a</h2>
        <ol className="wizard-steps" aria-label="Koraci">
          <li className={step === 1 ? 'active' : step > 1 ? 'done' : ''}>1. ISBN</li>
          <li className={step === 2 ? 'active' : step > 2 ? 'done' : ''}>2. Podaci o knjizi</li>
          <li className={step === 3 ? 'active' : ''}>3. Raspodela po filijalama</li>
        </ol>
      </div>

      {step === 1 && (
        <div className="wizard-panel">
          <label>
            ISBN *
            <input
              type="text"
              value={isbn}
              onChange={(event) => setIsbn(event.target.value)}
              placeholder="npr. 9780141439518"
              maxLength={32}
              disabled={lookupLoading}
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleIsbnSearch()}
              disabled={lookupLoading}
            >
              {lookupLoading ? 'Pretraga...' : 'Pretraži'}
            </button>
            <button type="button" className="secondary-button" onClick={onClose} disabled={lookupLoading}>
              Otkaži
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-panel wizard-panel-metadata">
          <div className="wizard-cover-section">
            {hasCover ? (
              <img
                src={coverUrl}
                alt={`Naslovna: ${metadata.title || 'knjiga'}`}
                className="wizard-cover-preview"
              />
            ) : (
              <div className="wizard-cover-placeholder">Nema dostupne korice</div>
            )}
            {!hasCover && (
              <label className="wizard-cover-url">
                URL slike korice (opciono)
                <input
                  type="text"
                  value={metadata.coverImageUrl}
                  onChange={(event) => updateMetadata('coverImageUrl', event.target.value)}
                  placeholder="https://..."
                  maxLength={1024}
                />
              </label>
            )}
            {hasCover && (
              <label className="wizard-cover-url">
                URL slike korice
                <input
                  type="text"
                  value={metadata.coverImageUrl}
                  onChange={(event) => updateMetadata('coverImageUrl', event.target.value)}
                  maxLength={1024}
                />
              </label>
            )}
          </div>

          <div className="admin-form-grid">
            <label>
              Naslov *
              <input
                type="text"
                value={metadata.title}
                onChange={(event) => updateMetadata('title', event.target.value)}
                maxLength={255}
                required
              />
            </label>

            <label>
              Autor *
              <input
                type="text"
                list="author-suggestions"
                value={metadata.authorName}
                onChange={(event) => updateMetadata('authorName', event.target.value)}
                maxLength={255}
                required
                autoComplete="off"
              />
              <datalist id="author-suggestions">
                {authorSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>

            <label>
              Žanr *
              <select
                value={metadata.genre}
                onChange={(event) =>
                  updateMetadata('genre', event.target.value as BookGenre | '')
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

            <label className="full-width">
              Opis (opciono)
              <textarea
                value={metadata.description}
                onChange={(event) => updateMetadata('description', event.target.value)}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="primary-button" onClick={handleStep2Next}>
              Dalje
            </button>
            <button type="button" className="secondary-button" onClick={handleBackToStep1}>
              Nazad
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard-panel">
          {branchesLoading ? (
            <p className="loading-state">Učitavanje filijala...</p>
          ) : (
            <>
              <div className="data-table-wrap">
                <table className="data-table wizard-branch-table">
                  <thead>
                    <tr>
                      <th>Filijala</th>
                      <th>Broj primeraka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => (
                      <tr key={branch.id}>
                        <td>{branch.name}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={branchCopies[branch.id] ?? 0}
                            onChange={(event) =>
                              setBranchCopies((current) => ({
                                ...current,
                                [branch.id]: Math.max(0, Number(event.target.value) || 0),
                              }))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="wizard-total-copies">
                Ukupno primeraka: <strong>{totalCopies}</strong>
              </p>
            </>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleSubmit()}
              disabled={submitLoading || branchesLoading}
            >
              {submitLoading ? 'Čuvanje...' : 'Sačuvaj knjigu'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setStep(2);
                setStepError(null);
              }}
              disabled={submitLoading}
            >
              Nazad
            </button>
          </div>
        </div>
      )}

      {stepError && <p className="message error">{stepError}</p>}
    </section>
  );
}
