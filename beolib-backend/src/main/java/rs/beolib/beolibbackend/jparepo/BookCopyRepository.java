package rs.beolib.beolibbackend.jparepo;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rs.beolib.beolibbackend.model.BookCopy;
import rs.beolib.beolibbackend.model.BookCopyStatus;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    List<BookCopy> findByBook_IdAndBranch_Id(Long bookId, Long branchId);

    long countByBook_IdAndBranch_Id(Long bookId, Long branchId);

    long countByBook_IdAndBranch_IdAndStatus(Long bookId, Long branchId, BookCopyStatus status);

    Optional<BookCopy> findFirstByBook_IdAndBranch_IdAndStatusOrderByIdAsc(
            Long bookId,
            Long branchId,
            BookCopyStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT bc FROM BookCopy bc
            WHERE bc.book.id = :bookId
              AND bc.branch.id = :branchId
              AND bc.status = :status
            ORDER BY bc.id ASC
            """)
    Optional<BookCopy> findFirstAvailableForUpdate(
            @Param("bookId") Long bookId,
            @Param("branchId") Long branchId,
            @Param("status") BookCopyStatus status
    );
}
