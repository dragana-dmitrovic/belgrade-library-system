# BeoLib - Belgrade Library System

BeoLib is a full-stack web application for managing a library system. The project consists of a Spring Boot backend and an Angular frontend. It provides basic functionality for user authentication, book management, library branches, reservations, and reading history.

This repository contains both backend and frontend parts of the application.

## Project Structure

```text
beolib
│
├── beolib-backend
│   ├── src
│   ├── pom.xml
│   └── ...
│
├── beolib-frontend
│   └── beolib
│       ├── src
│       ├── angular.json
│       ├── package.json
│       └── ...
│
└── README.md

## Main Features
User registration and login
JWT-based authentication
Role-based access control
Book listing and book details
Book management for administrators
Library branch management
Book reservations
Reservation status management
User reading history
Angular route guards for protected pages
HTTP interceptor for authenticated requests
REST API communication between frontend and backend
Technologies Used

##  Backend
Java
Spring Boot
Spring Security
JWT authentication
Spring Data JPA
Maven
SQL database
REST API
OpenAPI / Swagger configuration

## Frontend
Angular
TypeScript
HTML
CSS
Angular Router
Angular Services
Route Guards
HTTP Interceptors

## Backend Setup

Go to the backend folder:

cd beolib-backend

Create a local application.properties file inside:

src/main/resources/application.properties

Example configuration:

spring.application.name=beolib-backend

spring.datasource.url=jdbc:mysql://localhost:3306/beolib
spring.datasource.username=YOUR_DATABASE_USERNAME
spring.datasource.password=YOUR_DATABASE_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=YOUR_JWT_SECRET

## Run the backend application:

mvn spring-boot:run

The backend should be available at:

http://localhost:8080

If Swagger is enabled, the API documentation can usually be accessed at:

http://localhost:8080/swagger-ui/index.html
Frontend Setup

Go to the Angular project folder:

cd beolib-frontend/beolib

Install dependencies:

npm install

Start the Angular development server:

ng serve

The frontend should be available at:

http://localhost:4200
Environment Configuration

The frontend API URL is configured in the Angular environment files:

beolib-frontend/beolib/src/environments/environment.ts
beolib-frontend/beolib/src/environments/environment.development.ts

Example:

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};

The value of apiUrl should match the URL where the backend is running.

## Authentication

The application uses JWT authentication.

After a successful login, the frontend stores the authentication token and sends it with protected requests using an HTTP interceptor.

Protected routes are controlled with Angular guards.

## User Roles

The application supports role-based access control.

Typical roles include:

USER
ADMIN

Users can access regular library functionalities, while administrators can access management functionalities such as managing books, branches, and reservation statuses.

## Main Application Modules
Authentication

Includes user registration, login, token handling, and access control.

Books

Includes displaying books, viewing book details, and administrator book management.

Branches

Includes library branch data and administrator branch management.

Reservations

Includes creating and managing book reservations.

Reading History

Includes tracking books previously read or borrowed by a user.

Git Ignore Notes

The repository excludes generated, local, and sensitive files such as:

node_modules/
dist/
target/
.angular/cache/
application.properties
.env

Sensitive configuration should not be committed to GitHub.

Use example configuration files when needed, such as:

application-example.properties
Development Workflow

## Recommended workflow:

Start the backend application.
Start the Angular frontend.
Test frontend pages through the browser.
Test backend endpoints through Swagger or another API testing tool.
Commit changes only after verifying that both frontend and backend work correctly.
Repository Status

This is the initial full-stack version of the BeoLib project.

The current version includes the base backend structure, Angular frontend structure, authentication flow, route protection, models, services, and core pages.

Further improvements will include UI refinement, additional validation, better error handling, testing, and deployment configuration.

Author

Dragana Dmitrovic

License

This project is currently developed for educational and portfolio purposes.
