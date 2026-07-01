package rs.beolib.beolibbackend.jparepo;

import org.springframework.data.jpa.repository.JpaRepository;
import rs.beolib.beolibbackend.model.LibraryBranch;

public interface LibraryBranchRepository extends JpaRepository<LibraryBranch, Long> {
}
