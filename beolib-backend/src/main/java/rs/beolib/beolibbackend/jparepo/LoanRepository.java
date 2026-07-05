package rs.beolib.beolibbackend.jparepo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import rs.beolib.beolibbackend.model.Loan;
import rs.beolib.beolibbackend.model.LoanStatus;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    Optional<Loan> findByReservation_Id(Long reservationId);

    Optional<Loan> findByReservation_IdAndStatus(Long reservationId, LoanStatus status);

    List<Loan> findByUser_Id(Long userId);

    List<Loan> findByStatus(LoanStatus status);

    boolean existsByReservation_Id(Long reservationId);
}
