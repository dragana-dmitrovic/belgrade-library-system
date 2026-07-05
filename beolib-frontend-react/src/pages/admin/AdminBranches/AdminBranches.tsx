import { useCallback, useEffect, useState } from 'react';

import { getAllBranches } from '../../../api/branchApi';
import type { Branch } from '../../../models/branch.model';
import { getApiErrorMessage } from '../../../utils/api-error.util';
import './AdminBranches.css';

export function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await getAllBranches();
      setBranches(data);
    } catch (error) {
      setBranches([]);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  return (
    <div className="page">
      <h1>Admin — filijale</h1>

      <p className="readonly-note">
        Trenutno je dostupan samo pregled filijala. Dodavanje i izmena filijala zahteva
        backend podršku i poseban zadatak.
      </p>

      {errorMessage && <p className="message error page-feedback">{errorMessage}</p>}

      {loading ? (
        <p className="loading-state">Učitavanje filijala...</p>
      ) : branches.length === 0 ? (
        <div className="empty-state">Nema filijala u sistemu.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Adresa</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Radno vreme</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id}>
                  <td>{branch.name}</td>
                  <td>{branch.address}</td>
                  <td>{branch.phone}</td>
                  <td>{branch.email}</td>
                  <td>{branch.workingHours}</td>
                  <td>{branch.latitude}</td>
                  <td>{branch.longitude}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
