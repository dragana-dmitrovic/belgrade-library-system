import { Navigate, Route, Routes } from 'react-router-dom';

import { Navbar } from './components/Navbar/Navbar';
import { SiteFooter } from './components/SiteFooter/SiteFooter';
import { AdminRoute } from './routes/AdminRoute';
import { MemberRoute } from './routes/MemberRoute';
import { AdminBooksPage } from './pages/admin/AdminBooks/AdminBooks';
import { AdminBranchesPage } from './pages/admin/AdminBranches/AdminBranches';
import { BookDetailsPage } from './pages/BookDetails/BookDetails';
import { BooksPage } from './pages/Books/Books';
import { HomePage } from './pages/Home/Home';
import { LoginPage } from './pages/Login/Login';
import { ReadingHistoryPage } from './pages/ReadingHistory/ReadingHistory';
import { RegisterPage } from './pages/Register/Register';
import { LibrarianCirculationPage } from './pages/LibrarianCirculation/LibrarianCirculation';
import { ReservationsPage } from './pages/Reservations/Reservations';

function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailsPage />} />
          <Route
            path="/reservations"
            element={
              <MemberRoute>
                <ReservationsPage />
              </MemberRoute>
            }
          />
          <Route
            path="/reading-history"
            element={
              <MemberRoute>
                <ReadingHistoryPage />
              </MemberRoute>
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
          <Route
            path="/librarian/circulation"
            element={
              <AdminRoute>
                <LibrarianCirculationPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}

export default App;
