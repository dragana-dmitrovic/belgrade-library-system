package rs.beolib.beolibbackend.jparepo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rs.beolib.beolibbackend.model.ReadingHistory;

public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {

    @Query("""
            SELECT h FROM ReadingHistory h
            JOIN FETCH h.user
            JOIN FETCH h.book
            WHERE h.user.id = :userId
            ORDER BY h.finishedAt DESC
            """)
    List<ReadingHistory> findAllForUser(@Param("userId") Long userId);
}
