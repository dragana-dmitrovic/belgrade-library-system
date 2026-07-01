package rs.beolib.beolibbackend.jparepo;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.BookGenre;

public final class BookSpecification {

    private BookSpecification() {
    }

    public static Specification<Book> withFilters(String search, BookGenre genre, Boolean available) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("author")), like)
                ));
            }
            if (genre != null) {
                predicates.add(cb.equal(root.get("genre"), genre));
            }
            if (Boolean.TRUE.equals(available)) {
                predicates.add(cb.greaterThan(root.get("availableCopies"), 0));
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
