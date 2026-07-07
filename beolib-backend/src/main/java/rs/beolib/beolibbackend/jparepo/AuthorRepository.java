package rs.beolib.beolibbackend.jparepo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import rs.beolib.beolibbackend.model.Author;

public interface AuthorRepository extends JpaRepository<Author, Long> {

    Optional<Author> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Author> findTop10ByNameContainingIgnoreCaseOrderByNameAsc(String name);
}
