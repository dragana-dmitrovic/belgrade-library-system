package rs.beolib.beolibbackend.jparepo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rs.beolib.beolibbackend.model.Loan;
import rs.beolib.beolibbackend.model.LoanStatus;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    @Query("""
            SELECT l FROM Loan l
            JOIN FETCH l.user
            JOIN FETCH l.bookCopy bc
            JOIN FETCH bc.book
            JOIN FETCH bc.branch
            LEFT JOIN FETCH l.reservation
            WHERE l.id = :id
            """)
    Optional<Loan> findByIdWithDetails(@Param("id") Long id);

    Optional<Loan> findByReservation_Id(Long reservationId);

    Optional<Loan> findByReservation_IdAndStatus(Long reservationId, LoanStatus status);

    List<Loan> findByUser_Id(Long userId);

    List<Loan> findByStatus(LoanStatus status);

    boolean existsByReservation_Id(Long reservationId);

    boolean existsByBookCopy_Book_Id(Long bookId);

    boolean existsByUser_IdAndBookCopy_Book_IdAndStatus(
            Long userId,
            Long bookId,
            LoanStatus status
    );

    @Query("""
            SELECT l FROM Loan l
            JOIN FETCH l.bookCopy bc
            JOIN FETCH bc.book
            WHERE l.user.id = :userId
              AND l.status = :status
            ORDER BY l.returnedAt DESC, l.id DESC
            """)
    List<Loan> findByUser_IdAndStatusWithBook(
            @Param("userId") Long userId,
            @Param("status") LoanStatus status
    );

    @Query("""
            SELECT l FROM Loan l
            JOIN FETCH l.user
            JOIN FETCH l.bookCopy bc
            JOIN FETCH bc.book
            JOIN FETCH bc.branch
            LEFT JOIN FETCH l.reservation
            WHERE (:status IS NULL OR l.status = :status)
              AND (:memberEmail IS NULL OR LOWER(l.user.email) = LOWER(:memberEmail))
              AND (:bookTitle IS NULL OR LOWER(bc.book.title) LIKE LOWER(CONCAT('%', :bookTitle, '%')))
              AND (:branchId IS NULL OR bc.branch.id = :branchId)
            ORDER BY l.loanDate DESC
            """)
    List<Loan> findAllWithDetailsFiltered(
            @Param("status") LoanStatus status,
            @Param("memberEmail") String memberEmail,
            @Param("bookTitle") String bookTitle,
            @Param("branchId") Long branchId
    );
}
