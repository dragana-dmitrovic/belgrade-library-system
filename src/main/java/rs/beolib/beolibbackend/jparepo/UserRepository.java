package rs.beolib.beolibbackend.jparepo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import rs.beolib.beolibbackend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
