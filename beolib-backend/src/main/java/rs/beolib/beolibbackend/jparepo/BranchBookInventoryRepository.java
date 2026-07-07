package rs.beolib.beolibbackend.jparepo;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rs.beolib.beolibbackend.model.BranchBookInventory;

public interface BranchBookInventoryRepository extends JpaRepository<BranchBookInventory, Long> {

    Optional<BranchBookInventory> findByBook_IdAndBranch_Id(Long bookId, Long branchId);

    List<BranchBookInventory> findAllByBook_Id(Long bookId);

    List<BranchBookInventory> findAllByBranch_IdAndBook_IdIn(Long branchId, Collection<Long> bookIds);

    @Query("""
            SELECT i FROM BranchBookInventory i
            JOIN FETCH i.branch
            WHERE i.book.id = :bookId
            ORDER BY i.branch.id
            """)
    List<BranchBookInventory> findAllByBookIdWithBranch(@Param("bookId") Long bookId);
}
