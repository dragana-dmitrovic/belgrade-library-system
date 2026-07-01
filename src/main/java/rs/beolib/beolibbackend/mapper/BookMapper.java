package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.BookDto;
import rs.beolib.beolibbackend.model.Book;

public final class BookMapper {

    private BookMapper() {
    }

    public static BookDto toDto(Book book) {
        if (book == null) {
            return null;
        }
        return new BookDto(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getGenre().name(),
                book.getDescription(),
                book.getCoverImageUrl(),
                book.getTotalCopies(),
                book.getAvailableCopies()
        );
    }
}
