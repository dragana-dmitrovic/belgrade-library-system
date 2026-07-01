package rs.beolib.beolibbackend.jparepo;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rs.beolib.beolibbackend.model.Reservation;
import rs.beolib.beolibbackend.model.ReservationStatus;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    boolean existsByUser_IdAndBook_IdAndStatusIn(Long userId, Long bookId, Collection<ReservationStatus> statuses);

    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.user
            JOIN FETCH r.book
            JOIN FETCH r.branch
            WHERE r.user.id = :userId
            ORDER BY r.reservedAt DESC
            """)
    List<Reservation> findAllForUser(@Param("userId") Long userId);

    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.user
            JOIN FETCH r.book
            JOIN FETCH r.branch
            ORDER BY r.reservedAt DESC
            """)
    List<Reservation> findAllWithDetails();
}
