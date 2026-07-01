package rs.beolib.beolibbackend.service;

import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.BookCreateRequest;
import rs.beolib.beolibbackend.dto.BookDto;
import rs.beolib.beolibbackend.dto.BookUpdateRequest;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.BookSpecification;
import rs.beolib.beolibbackend.mapper.BookMapper;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.BookGenre;

@Service
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional(readOnly = true)
    public List<BookDto> findAll(String search, String genreParam, Boolean available) {
        BookGenre genre = parseGenreOptional(genreParam);
        Specification<Book> spec = BookSpecification.withFilters(search, genre, available);
        return bookRepository.findAll(spec).stream().map(BookMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public BookDto findById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + id));
        return BookMapper.toDto(book);
    }

    public BookDto create(BookCreateRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new IllegalArgumentException("ISBN already exists");
        }
        Book book = new Book();
        applyCreate(request, book);
        return BookMapper.toDto(bookRepository.save(book));
    }

    public BookDto update(BookUpdateRequest request) {
        Book book = bookRepository.findById(request.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + request.getId()));
        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbnAndIdNot(request.getIsbn(), request.getId())) {
            throw new IllegalArgumentException("ISBN already exists");
        }
        applyUpdate(request, book);
        return BookMapper.toDto(bookRepository.save(book));
    }

    public void deleteById(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book not found: " + id);
        }
        bookRepository.deleteById(id);
    }

    private void applyCreate(BookCreateRequest request, Book book) {
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setGenre(parseGenreRequired(request.getGenre()));
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getAvailableCopies());
    }

    private void applyUpdate(BookUpdateRequest request, Book book) {
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setGenre(parseGenreRequired(request.getGenre()));
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getAvailableCopies());
    }

    private BookGenre parseGenreRequired(String raw) {
        try {
            return BookGenre.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown genre: " + raw);
        }
    }

    private BookGenre parseGenreOptional(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return parseGenreRequired(raw);
    }
}
