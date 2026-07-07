package rs.beolib.beolibbackend.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.BookCreateRequest;
import rs.beolib.beolibbackend.dto.BookCreateWithInventoryRequest;
import rs.beolib.beolibbackend.dto.BookDto;
import rs.beolib.beolibbackend.dto.BookUpdateRequest;
import rs.beolib.beolibbackend.dto.PagedResponse;
import rs.beolib.beolibbackend.exception.BookHasHistoryException;
import rs.beolib.beolibbackend.exception.DuplicateIsbnException;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookCopyRepository;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.BookSpecification;
import rs.beolib.beolibbackend.jparepo.BranchBookInventoryRepository;
import rs.beolib.beolibbackend.jparepo.LibraryBranchRepository;
import rs.beolib.beolibbackend.jparepo.LoanRepository;
import rs.beolib.beolibbackend.jparepo.ReservationRepository;
import rs.beolib.beolibbackend.mapper.BookMapper;
import rs.beolib.beolibbackend.model.Author;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.BookCopy;
import rs.beolib.beolibbackend.model.BookCopyStatus;
import rs.beolib.beolibbackend.model.BookGenre;
import rs.beolib.beolibbackend.model.BranchBookInventory;
import rs.beolib.beolibbackend.model.LibraryBranch;
import rs.beolib.beolibbackend.dto.BranchCopyAllocation;

@Service
@Transactional
public class BookService {

    private static final String BOOK_HAS_HISTORY_MESSAGE =
            "Knjiga ima istoriju pozajmica ili rezervacija i ne može se obrisati.";
    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "title", "id", "isbn", "genre", "totalCopies", "availableCopies"
    );

    private final BookRepository bookRepository;
    private final BranchBookInventoryRepository branchBookInventoryRepository;
    private final BranchBookInventoryService branchBookInventoryService;
    private final AuthorService authorService;
    private final BookCopyRepository bookCopyRepository;
    private final LibraryBranchRepository libraryBranchRepository;
    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;

    public BookService(
            BookRepository bookRepository,
            BranchBookInventoryRepository branchBookInventoryRepository,
            BranchBookInventoryService branchBookInventoryService,
            AuthorService authorService,
            BookCopyRepository bookCopyRepository,
            LibraryBranchRepository libraryBranchRepository,
            LoanRepository loanRepository,
            ReservationRepository reservationRepository
    ) {
        this.bookRepository = bookRepository;
        this.branchBookInventoryRepository = branchBookInventoryRepository;
        this.branchBookInventoryService = branchBookInventoryService;
        this.authorService = authorService;
        this.bookCopyRepository = bookCopyRepository;
        this.libraryBranchRepository = libraryBranchRepository;
        this.loanRepository = loanRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<BookDto> findAll(String search, String genreParam, Boolean available, Long branchId) {
        BookGenre genre = parseGenreOptional(genreParam);
        Specification<Book> spec = BookSpecification.withFilters(search, genre, available, branchId);
        List<Book> books = bookRepository.findAll(spec);
        return mapBooksToDtos(books, branchId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookDto> findAllPaged(
            String search,
            String genreParam,
            Boolean available,
            Long branchId,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        BookGenre genre = parseGenreOptional(genreParam);
        Specification<Book> spec = BookSpecification.withFilters(search, genre, available, branchId);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);
        Page<Book> bookPage = bookRepository.findAll(spec, pageable);
        List<BookDto> values = mapBooksToDtos(bookPage.getContent(), branchId);
        return new PagedResponse<>(
                values,
                bookPage.getNumber(),
                bookPage.getSize(),
                bookPage.getTotalElements(),
                bookPage.getTotalPages()
        );
    }

    private List<BookDto> mapBooksToDtos(List<Book> books, Long branchId) {
        if (branchId == null) {
            return books.stream().map(BookMapper::toDto).toList();
        }
        List<Long> bookIds = books.stream().map(Book::getId).toList();
        if (bookIds.isEmpty()) {
            return List.of();
        }
        Map<Long, BranchBookInventory> inventoryByBookId = branchBookInventoryRepository
                .findAllByBranch_IdAndBook_IdIn(branchId, bookIds)
                .stream()
                .collect(Collectors.toMap(inventory -> inventory.getBook().getId(), Function.identity()));
        return books.stream()
                .map(book -> BookMapper.toDto(book, inventoryByBookId.get(book.getId())))
                .toList();
    }

    private Sort buildSort(String sortBy, String sortDirection) {
        String field = sortBy != null && !sortBy.isBlank() ? sortBy.trim() : "title";
        if (!ALLOWED_SORT_FIELDS.contains(field)) {
            throw new IllegalArgumentException("Unsupported sort field: " + field);
        }
        Sort.Direction direction = Sort.Direction.ASC;
        if (sortDirection != null && sortDirection.equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }
        return Sort.by(direction, field);
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
        if (request.getAvailableCopies() > request.getTotalCopies()) {
            throw new IllegalArgumentException("Available copies cannot exceed total copies");
        }
        Book book = new Book();
        applyCreate(request, book);
        Book saved = bookRepository.save(book);
        branchBookInventoryService.createDefaultInventory(
                saved,
                request.getTotalCopies(),
                request.getAvailableCopies()
        );
        return BookMapper.toDto(saved);
    }

    public BookDto createWithInventory(BookCreateWithInventoryRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateIsbnException("Knjiga sa tim ISBN već postoji");
        }

        validateBranchesExist(request.getBranchAllocations());

        BookGenre genre = parseGenreRequired(request.getGenre());

        int totalCopies = request.getBranchAllocations().stream()
                .filter(allocation -> allocation.getCopyCount() != null && allocation.getCopyCount() > 0)
                .mapToInt(BranchCopyAllocation::getCopyCount)
                .sum();
        if (totalCopies <= 0) {
            throw new IllegalArgumentException("At least one branch must have copyCount greater than 0");
        }

        Author author = authorService.findOrCreateByName(request.getAuthorName());

        Book book = new Book();
        book.setTitle(request.getTitle().trim());
        book.setAuthor(author);
        book.setIsbn(request.getIsbn().trim());
        book.setGenre(genre);
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(totalCopies);

        Book savedBook = bookRepository.saveAndFlush(book);

        for (BranchCopyAllocation allocation : request.getBranchAllocations()) {
            if (allocation.getCopyCount() == null || allocation.getCopyCount() <= 0) {
                continue;
            }
            LibraryBranch branch = libraryBranchRepository.findById(allocation.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Branch not found: " + allocation.getBranchId()));

            BranchBookInventory inventory = new BranchBookInventory();
            inventory.setBook(savedBook);
            inventory.setBranch(branch);
            inventory.setTotalCopies(allocation.getCopyCount());
            inventory.setAvailableCopies(allocation.getCopyCount());
            branchBookInventoryRepository.save(inventory);

            for (int sequence = 1; sequence <= allocation.getCopyCount(); sequence++) {
                BookCopy copy = new BookCopy();
                copy.setBook(savedBook);
                copy.setBranch(branch);
                copy.setCopyCode(formatCopyCode(savedBook.getId(), branch.getId(), sequence));
                copy.setStatus(BookCopyStatus.AVAILABLE);
                bookCopyRepository.save(copy);
            }

            branchBookInventoryService.syncInventoryFromBookCopies(savedBook.getId(), branch.getId());
        }

        branchBookInventoryService.syncBookAggregatesByBookId(savedBook.getId());
        return BookMapper.toDto(bookRepository.findById(savedBook.getId()).orElseThrow());
    }

    public BookDto update(BookUpdateRequest request) {
        Book book = bookRepository.findById(request.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + request.getId()));
        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbnAndIdNot(request.getIsbn(), request.getId())) {
            throw new IllegalArgumentException("ISBN already exists");
        }
        if (request.getAvailableCopies() > request.getTotalCopies()) {
            throw new IllegalArgumentException("Available copies cannot exceed total copies");
        }

        int deltaTotal = request.getTotalCopies() - book.getTotalCopies();
        int deltaAvailable = request.getAvailableCopies() - book.getAvailableCopies();

        applyUpdate(request, book);
        bookRepository.save(book);

        if (deltaTotal != 0 || deltaAvailable != 0) {
            branchBookInventoryService.adjustDefaultBranchInventory(book, deltaTotal, deltaAvailable);
        }

        return BookMapper.toDto(bookRepository.findById(book.getId()).orElseThrow());
    }

    public void deleteById(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book not found: " + id);
        }
        ensureBookHasNoHistory(id);
        bookRepository.deleteById(id);
    }

    private void ensureBookHasNoHistory(Long bookId) {
        if (loanRepository.existsByBookCopy_Book_Id(bookId)
                || reservationRepository.existsByBook_Id(bookId)) {
            throw new BookHasHistoryException(BOOK_HAS_HISTORY_MESSAGE);
        }
    }

    private void applyCreate(BookCreateRequest request, Book book) {
        book.setTitle(request.getTitle());
        book.setAuthor(authorService.findOrCreateByName(request.getAuthorName()));
        book.setIsbn(request.getIsbn());
        book.setGenre(parseGenreRequired(request.getGenre()));
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getAvailableCopies());
    }

    private void applyUpdate(BookUpdateRequest request, Book book) {
        book.setTitle(request.getTitle());
        book.setAuthor(authorService.findOrCreateByName(request.getAuthorName()));
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

    private void validateBranchesExist(List<BranchCopyAllocation> allocations) {
        for (BranchCopyAllocation allocation : allocations) {
            if (allocation.getBranchId() == null) {
                continue;
            }
            if (!libraryBranchRepository.existsById(allocation.getBranchId())) {
                throw new ResourceNotFoundException("Branch not found: " + allocation.getBranchId());
            }
        }
    }

    static String formatCopyCode(Long bookId, Long branchId, int sequence) {
        return String.format("B%d-BR%d-%02d", bookId, branchId, sequence);
    }
}
