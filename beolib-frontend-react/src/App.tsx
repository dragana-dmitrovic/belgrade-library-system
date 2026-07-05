import { Navigate, Route, Routes } from 'react-router-dom';

import { Navbar } from './components/Navbar/Navbar';
import { AdminRoute } from './routes/AdminRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminBooksPage } from './pages/admin/AdminBooks/AdminBooks';
import { AdminBranchesPage } from './pages/admin/AdminBranches/AdminBranches';
import { BookDetailsPage } from './pages/BookDetails/BookDetails';
import { BooksPage } from './pages/Books/Books';
import { HomePage } from './pages/Home/Home';
import { LoginPage } from './pages/Login/Login';
import { ReadingHistoryPage } from './pages/ReadingHistory/ReadingHistory';
import { RegisterPage } from './pages/Register/Register';
import { ReservationsPage } from './pages/Reservations/Reservations';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reading-history"
          element={
            <ProtectedRoute>
              <ReadingHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <AdminRoute>
              <AdminBooksPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/branches"
          element={
            <AdminRoute>
              <AdminBranchesPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
