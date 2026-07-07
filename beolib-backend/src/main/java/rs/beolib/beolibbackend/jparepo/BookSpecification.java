package rs.beolib.beolibbackend.jparepo;



import jakarta.persistence.criteria.Join;

import jakarta.persistence.criteria.JoinType;

import jakarta.persistence.criteria.Predicate;

import jakarta.persistence.criteria.Root;

import jakarta.persistence.criteria.Subquery;

import java.util.ArrayList;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import rs.beolib.beolibbackend.model.Author;

import rs.beolib.beolibbackend.model.Book;

import rs.beolib.beolibbackend.model.BookGenre;

import rs.beolib.beolibbackend.model.BranchBookInventory;



public final class BookSpecification {



    private BookSpecification() {

    }



    public static Specification<Book> withFilters(

            String search,

            BookGenre genre,

            Boolean available,

            Long branchId

    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (search != null) {
                String trimmedSearch = search.trim();
                if (!trimmedSearch.isBlank()) {
                    String like = "%" + trimmedSearch.toLowerCase() + "%";
                    Join<Book, Author> authorJoin = root.join("author", JoinType.LEFT);

                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("title")), like),
                            cb.like(cb.lower(authorJoin.get("name")), like),
                            cb.like(cb.lower(root.get("isbn")), like)
                    ));
                }
            }

            if (genre != null) {

                predicates.add(cb.equal(root.get("genre"), genre));

            }

            if (branchId != null) {

                predicates.add(bookInBranch(root, query, cb, branchId, available));

            } else if (Boolean.TRUE.equals(available)) {

                predicates.add(cb.greaterThan(root.get("availableCopies"), 0));

            }

            if (predicates.isEmpty()) {

                return cb.conjunction();

            }

            return cb.and(predicates.toArray(Predicate[]::new));

        };

    }



    private static Predicate bookInBranch(

            Root<Book> root,

            jakarta.persistence.criteria.CriteriaQuery<?> query,

            jakarta.persistence.criteria.CriteriaBuilder cb,

            Long branchId,

            Boolean available

    ) {

        Subquery<Long> subquery = query.subquery(Long.class);

        Root<BranchBookInventory> inventoryRoot = subquery.from(BranchBookInventory.class);

        subquery.select(inventoryRoot.get("book").get("id"));



        List<Predicate> inventoryPredicates = new ArrayList<>();

        inventoryPredicates.add(cb.equal(inventoryRoot.get("branch").get("id"), branchId));

        if (Boolean.TRUE.equals(available)) {

            inventoryPredicates.add(cb.greaterThan(inventoryRoot.get("availableCopies"), 0));

        }

        subquery.where(cb.and(inventoryPredicates.toArray(Predicate[]::new)));

        return root.get("id").in(subquery);

    }

}


