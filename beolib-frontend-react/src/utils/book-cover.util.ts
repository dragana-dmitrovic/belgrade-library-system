/** Uklanja razmake i crtice iz ISBN pre slanja Open Library servisu. */
export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[\s-]/g, '');
}

/** Generiše Open Library URL naslovnice po ISBN-u. */
export function buildOpenLibraryCoverUrl(isbn: string): string | null {
  const normalized = normalizeIsbn(isbn.trim());
  if (!normalized) {
    return null;
  }
  return `https://covers.openlibrary.org/b/isbn/${normalized}-L.jpg`;
}

/**
 * Bira URL naslovnice: eksplicitni coverImageUrl ima prioritet,
 * inače se gradi Open Library URL iz ISBN-a.
 */
export function resolveBookCoverUrl(
  coverImageUrl?: string | null,
  isbn?: string | null,
): string | null {
  const trimmedUrl = coverImageUrl?.trim();
  if (trimmedUrl) {
    return trimmedUrl;
  }

  if (isbn?.trim()) {
    return buildOpenLibraryCoverUrl(isbn);
  }

  return null;
}
