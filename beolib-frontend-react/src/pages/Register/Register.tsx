import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/api-error.util';
import './Register.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Lozinka mora imati najmanje 6 karaktera.');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      navigate('/login?registered=true');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Email is already registered'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <h1>Registracija</h1>

      {errorMessage && <p className="message error">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Ime
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            required
          />
        </label>

        <label>
          Prezime
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            required
          />
        </label>

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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        {password.length > 0 && password.length < 6 && (
          <p className="field-error">Lozinka mora imati najmanje 6 karaktera.</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Registracija...' : 'Registruj se'}
        </button>
      </form>

      <p className="hint">
        Već imaš nalog? <Link to="/login">Prijavi se</Link>
      </p>
    </section>
  );
}
