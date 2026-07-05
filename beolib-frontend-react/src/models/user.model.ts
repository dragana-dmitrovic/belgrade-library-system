import type { UserRole } from './enums.model';

/** Odgovara backend UserDto. */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}
