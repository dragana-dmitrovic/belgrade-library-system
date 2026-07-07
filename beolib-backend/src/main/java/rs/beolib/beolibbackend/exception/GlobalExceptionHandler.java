package rs.beolib.beolibbackend.exception;

import jakarta.persistence.OptimisticLockException;
import jakarta.persistence.PersistenceException;
import java.util.stream.Collectors;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import rs.beolib.beolibbackend.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookHasHistoryException.class)
    public ResponseEntity<ApiResponse<Object>> handleBookHasHistory(BookHasHistoryException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.of(409, ex.getMessage(), (Object) null));
    }

    @ExceptionHandler(BookNotFoundByIsbnException.class)
    public ResponseEntity<ApiResponse<Object>> handleBookNotFoundByIsbn(BookNotFoundByIsbnException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.of(404, ex.getMessage(), (Object) null));
    }

    @ExceptionHandler(DuplicateIsbnException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicateIsbn(DuplicateIsbnException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.of(409, ex.getMessage(), (Object) null));
    }

    @ExceptionHandler(ExternalServiceUnavailableException.class)
    public ResponseEntity<ApiResponse<Object>> handleExternalServiceUnavailable(
            ExternalServiceUnavailableException ex
    ) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.of(503, ex.getMessage(), (Object) null));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.of(404, ex.getMessage(), (Object) null));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.of(400, ex.getMessage(), (Object) null));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(IllegalArgumentException ex) {
        String message = resolveEnumMigrationMessage(ex);
        if (message == null) {
            message = ex.getMessage();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.of(400, message, (Object) null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String message = resolveDataIntegrityMessage(ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.of(400, message, (Object) null));
    }

    @ExceptionHandler({DataAccessException.class, PersistenceException.class})
    public ResponseEntity<ApiResponse<Object>> handleDataAccess(Exception ex) {
        String message = resolveEnumMigrationMessage(ex);
        if (message != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.of(400, message, (Object) null));
        }

        String integrity = resolveDataIntegrityMessage(ex);
        if (integrity != null && !integrity.equals("Database constraint violation.")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.of(400, integrity, (Object) null));
        }

        String deepest = deepestMessage(ex);
        if (deepest != null) {
            String lower = deepest.toLowerCase();
            if (lower.contains("could not initialize") || lower.contains("lazy")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.of(500, "Failed to load loan details: " + deepest, (Object) null));
            }
            if (lower.contains("cannot be null")
                    || lower.contains("duplicate")
                    || lower.contains("foreign key")
                    || lower.contains("constraint")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.of(400, "Database constraint violation: " + deepest, (Object) null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.of(500, deepest, (Object) null));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.of(500, "Database error occurred", (Object) null));
    }

    @ExceptionHandler({OptimisticLockException.class, OptimisticLockingFailureException.class})
    public ResponseEntity<ApiResponse<Object>> handleOptimisticLock(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.of(409, "Inventory was updated by another request. Please try again.", (Object) null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.of(400, message, (Object) null));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.of(401, "Invalid email or password", (Object) null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuth(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.of(401, ex.getMessage(), (Object) null));
    }

    private String resolveEnumMigrationMessage(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            String message = current.getMessage();
            if (message != null && message.contains("No enum constant")) {
                if (message.contains("ReservationStatus")) {
                    return "Reservation has an invalid status in the database. "
                            + "Restart the backend after data.sql migration or run: "
                            + "UPDATE reservations SET status='ACTIVE' WHERE status IN ('PENDING','APPROVED'); "
                            + "UPDATE reservations SET status='PICKED_UP' WHERE status='RETURNED'; "
                            + "UPDATE reservations SET status='CANCELLED' WHERE status IS NULL OR status='';";
                }
                if (message.contains("BookCopyStatus")) {
                    return "Book copy has an invalid status in the database. "
                            + "Contact administrator or reset dev database.";
                }
                if (message.contains("LoanStatus")) {
                    return "Loan has an invalid status in the database. "
                            + "Contact administrator or reset dev database.";
                }
            }
            current = current.getCause();
        }
        return null;
    }

    private String resolveDataIntegrityMessage(Throwable ex) {
        String raw = deepestMessage(ex);
        if (raw == null) {
            return "Database constraint violation.";
        }

        String lower = raw.toLowerCase();
        if (lower.contains("reservation_id") && lower.contains("cannot be null")) {
            return "Loan reservation_id column must allow NULL for direct loans. "
                    + "Run: ALTER TABLE loans MODIFY reservation_id BIGINT NULL;";
        }
        if (lower.contains("book_copy")) {
            return "Knjiga se ne može obrisati zbog povezanih podataka u bazi (pozajmice/rezervacije).";
        }
        return "Database constraint violation: " + raw;
    }

    private String deepestMessage(Throwable ex) {
        Throwable current = ex;
        String message = null;
        while (current != null) {
            if (current.getMessage() != null) {
                message = current.getMessage();
            }
            current = current.getCause();
        }
        return message;
    }
}
