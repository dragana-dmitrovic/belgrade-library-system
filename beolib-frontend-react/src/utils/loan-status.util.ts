import type { LoanStatus } from '../models/loan-status.model';
import { todayIsoDate } from './date.util';

const STATUS_LABELS: Record<LoanStatus, string> = {
  ACTIVE: 'Aktivna',
  RETURNED: 'Vraćena',
};

export function formatLoanStatus(status: string): string {
  if (status === 'ACTIVE' || status === 'RETURNED') {
    return STATUS_LABELS[status];
  }
  return status;
}

export function isLoanOverdue(status: string, dueDate: string): boolean {
  if (status !== 'ACTIVE') {
    return false;
  }
  return dueDate < todayIsoDate();
}

export function getLoanDisplayStatus(status: string, dueDate: string): string {
  if (isLoanOverdue(status, dueDate)) {
    return 'Prekoračen rok';
  }
  return formatLoanStatus(status);
}

export function loanStatusPillClass(status: string): string {
  if (status === 'RETURNED') {
    return 'status-pill closed';
  }
  return 'status-pill';
}

export function loanStatusPillClassForLoan(status: string, dueDate: string): string {
  if (isLoanOverdue(status, dueDate)) {
    return 'status-pill overdue';
  }
  return loanStatusPillClass(status);
}
