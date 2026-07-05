import { BOOK_GENRES, type BookGenre } from '../models/enums.model';

/** Čitljiv prikaz za backend enum vrednosti — API i dalje koristi originalni string. */
const GENRE_LABELS: Record<BookGenre, string> = {
  FICTION: 'Fikcija',
  NON_FICTION: 'Non-fikcija',
  SCIENCE: 'Nauka',
  HISTORY: 'Istorija',
  ROMANCE: 'Romantika',
  MYSTERY: 'Misterija',
  BIOGRAPHY: 'Biografija',
  CHILDREN: 'Deca',
  OTHER: 'Ostalo',
};

export function formatGenre(genre: string): string {
  if ((BOOK_GENRES as string[]).includes(genre)) {
    return GENRE_LABELS[genre as BookGenre];
  }
  return genre;
}

export function getGenreOptions(): { value: BookGenre; label: string }[] {
  return BOOK_GENRES.map((genre) => ({
    value: genre,
    label: GENRE_LABELS[genre],
  }));
}
