import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/api-error.util';
import './Login.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registracija uspešna, uloguj se.');
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Unesite email i lozinku.');
      return;
    }

    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/books');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <h1>Prijava</h1>

      {successMessage && <p className="message success">{successMessage}</p>}
      {errorMessage && <p className="message error">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Lozinka
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="gold-button" disabled={loading}>
          {loading ? 'Prijava...' : 'Prijavi se'}
        </button>
      </form>

      <p className="hint">
        Nemaš nalog? <Link to="/register">Registruj se</Link>
      </p>
    </section>
  );
}
