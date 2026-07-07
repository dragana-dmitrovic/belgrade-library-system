package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.BookDto;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.BranchBookInventory;

public final class BookMapper {

    private BookMapper() {
    }

    public static BookDto toDto(Book book) {
        return toDto(book, null);
    }

    public static BookDto toDto(Book book, BranchBookInventory branchInventory) {
        if (book == null) {
            return null;
        }
        Integer branchTotal = null;
        Integer branchAvailable = null;
        if (branchInventory != null) {
            branchTotal = branchInventory.getTotalCopies();
            branchAvailable = branchInventory.getAvailableCopies();
        }
        return new BookDto(
                book.getId(),
                book.getTitle(),
                book.getAuthor() != null ? book.getAuthor().getName() : null,
                book.getIsbn(),
                book.getGenre().name(),
                book.getDescription(),
                book.getCoverImageUrl(),
                book.getTotalCopies(),
                book.getAvailableCopies(),
                branchTotal,
                branchAvailable
        );
    }
}
