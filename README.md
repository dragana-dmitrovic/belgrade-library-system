# BeoLib - Belgrade Library System

BeoLib is a full-stack web application for managing a library system.

The project consists of a Spring Boot backend and a React frontend. The application supports public book browsing, member registration and reservations, librarian book management, circulation workflows, reading history, reviews, and inventory tracking across library branches.

---

## Project Structure

    beolib
    ├── beolib-backend
    │   ├── src
    │   ├── pom.xml
    │   └── ...
    │
    ├── beolib-frontend-react
    │   ├── src
    │   ├── public
    │   ├── package.json
    │   ├── vite.config.ts
    │   └── ...
    │
    ├── .gitignore
    └── README.md

---

## Main Features

- User registration and login
- JWT-based authentication
- Role-based access control
- Member and librarian user types
- Public book catalog
- Book details page with availability and reader reviews
- Book search by title, author, and ISBN
- Server-side pagination for book catalog and admin book list
- Book management for librarians
- Manual book creation
- ISBN-based book creation using Open Library metadata
- Author autocomplete to reduce duplicate authors
- Library branch management
- Book inventory tracking by branch
- Individual book copies with copy codes
- Book reservations by members
- Reservation status management
- Direct loan creation by librarian
- Loan creation from reservation
- Book return workflow
- Reading history for members
- Reader ratings and reviews
- Safe book deletion with history checks
- Centralized API error handling
- REST API communication between frontend and backend

---

## Technologies Used

### Backend

- Java
- Spring Boot
- Spring Security
- JWT authentication
- Spring Data JPA
- Hibernate
- Maven
- MySQL
- REST API
- Open Library API integration

### Frontend

- React
- TypeScript
- Vite
- HTML
- CSS
- React Router
- Axios
- Context API
- Protected routes
- Reusable UI components

---

## Backend Setup

Go to the backend folder:

    cd beolib-backend

Create a local application configuration file:

    src/main/resources/application.properties

Example configuration:

    spring.application.name=beolib-backend

    spring.datasource.url=jdbc:mysql://localhost:3306/beolib
    spring.datasource.username=YOUR_DATABASE_USERNAME
    spring.datasource.password=YOUR_DATABASE_PASSWORD

    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true

    jwt.secret=YOUR_JWT_SECRET

Run the backend application:

    mvn spring-boot:run

The backend should be available at:

    http://localhost:8080

---

## Frontend Setup

Go to the React frontend folder:

    cd beolib-frontend-react

Install dependencies:

    npm install

Start the React development server:

    npm run dev

The frontend should be available at:

    http://localhost:5173

---

## Environment Configuration

The frontend API URL is configured through Vite environment variables.

Create a local `.env` file in the `beolib-frontend-react` folder:

    VITE_API_URL=http://localhost:8080/api

The value of `VITE_API_URL` should match the URL where the backend API is running.

---

## Authentication

The application uses JWT authentication.

After a successful login, the backend returns a token and user data. The React frontend stores the session in `sessionStorage` and sends the token with protected requests using the `Authorization: Bearer <token>` header.

Protected pages are controlled with route components such as `ProtectedRoute`, `MemberRoute`, and `AdminRoute`.

---

## User Roles

The application supports role-based access control through two main user types:

- MEMBER
- LIBRARIAN

Members can browse the catalog, reserve books, view their reservations, and manage their reading history and reviews.

Librarians can manage books, branches, reservations, loans, inventory, and circulation workflows.

The backend uses `User` as a base entity, with `Member` and `Librarian` as specialized user types.

---

## Main Application Modules

### Authentication

Includes registration, login, JWT handling, session management, and protected routes.

### Books

Includes public book listing, book details, search, filtering, pagination, availability display, and reader reviews.

### Book Management

Includes librarian book administration, manual book creation, editing, safe deletion, and ISBN-based book creation.

The ISBN workflow uses Open Library metadata and allows the librarian to review and edit book data before saving.

### Authors

Includes author entity management through book creation and autocomplete search when adding books through the ISBN wizard.

### Branches and Inventory

Includes library branch data, branch management, book availability by branch, and inventory records for each book-branch pair.

### Book Copies

Includes individual physical book copies, each with a unique copy code and status.

Possible copy statuses include:

- AVAILABLE
- RESERVED
- LOANED

### Reservations

Includes member book reservations, reservation cancellation, active reservation management, and reservation expiration handling.

Possible reservation statuses include:

- ACTIVE
- PICKED_UP
- CANCELLED
- EXPIRED

### Circulation

Includes librarian workflows for direct loan creation, issuing books from reservations, returning books, and viewing active loans and reservations.

Possible loan statuses include:

- ACTIVE
- RETURNED

### Reading History and Reviews

Includes member reading history, ratings, review text, and public display of reviews on the book details page.

---

## API Response Format

The backend uses a standard API response wrapper.

Typical response structure:

    {
      "message": "Success message",
      "status": 200,
      "data": {
        "value": {}
      }
    }

The frontend uses helper functions to extract response values and display backend error messages consistently.

---

## Pagination

The book catalog and admin book list use server-side pagination.

Example endpoint:

    GET /api/books?page=0&size=24&search=tolkien&sortBy=title&sortDirection=asc

The backend returns a paged response containing:

- current page
- page size
- total number of elements
- total number of pages
- list of books for the current page

This improves performance and prevents loading all books at once.

---

## ISBN Book Workflow

Librarians can add a book by entering an ISBN.

The backend checks whether the ISBN already exists in the catalog. If it does not, metadata is fetched from Open Library and returned to the frontend. The librarian can then edit the title, author, genre, description, cover image, and branch allocation before saving the book.

When the book is saved, the backend creates:

- the book record
- the author if needed
- branch inventory records
- individual book copies
- unique copy codes

---

## Safe Book Deletion

Books with loan or reservation history cannot be deleted.

Before deletion, the backend checks whether the book has related loans or reservations. If history exists, the system returns a conflict response with a clear message instead of relying on a database constraint error.

---

## Git Ignore Notes

The repository excludes generated, local, and sensitive files such as:

- node_modules/
- dist/
- target/
- application.properties
- .env
- .env.local
- local database backups
- temporary logs

Sensitive configuration should not be committed to GitHub.

---

## Development Workflow

Recommended workflow:

1. Start the backend application.
2. Start the React frontend.
3. Test frontend pages through the browser.
4. Test backend endpoints through the browser, Postman, or another API testing tool.
5. Run backend compile before committing major backend changes.
6. Run frontend build before committing major frontend changes.
7. Commit changes only after verifying that both frontend and backend work correctly.

Useful commands:

Backend:

    cd beolib-backend
    mvn compile
    mvn spring-boot:run

Frontend:

    cd beolib-frontend-react
    npm install
    npm run dev
    npm run build

---

## Repository Status

This version of BeoLib includes the completed full-stack implementation with Spring Boot backend and React frontend.

The current version includes authentication, role-based access control, book catalog, librarian administration, ISBN workflow, pagination, branch inventory, reservations, circulation, reading history, reviews, and improved UI components.

---

## Author

Dragana Dmitrovic

---

## License

This project is currently developed for educational and portfolio purposes.
