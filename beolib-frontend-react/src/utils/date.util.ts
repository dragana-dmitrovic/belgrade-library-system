/** Formatira ISO datum (YYYY-MM-DD) za prikaz. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (year && month && day) {
    return `${day}.${month}.${year}.`;
  }
  return isoDate;
}

/** Formatira ISO datetime string za prikaz. */
export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }
  return date.toLocaleString('sr-RS');
}

/** Današnji datum u YYYY-MM-DD (za max na input type="date"). */
export function todayIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
