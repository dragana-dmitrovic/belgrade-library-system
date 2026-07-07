package rs.beolib.beolibbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rs.beolib.beolibbackend.dto.ApiResponse;
import rs.beolib.beolibbackend.dto.BookBranchAvailabilityDto;
import rs.beolib.beolibbackend.dto.BookReviewDto;
import rs.beolib.beolibbackend.dto.BookCreateRequest;
import rs.beolib.beolibbackend.dto.BookCreateWithInventoryRequest;
import rs.beolib.beolibbackend.dto.BookDto;
import rs.beolib.beolibbackend.dto.BookMetadataLookupDto;
import rs.beolib.beolibbackend.dto.BookUpdateRequest;
import rs.beolib.beolibbackend.dto.PagedResponse;
import rs.beolib.beolibbackend.service.BookMetadataService;
import rs.beolib.beolibbackend.service.BookService;
import rs.beolib.beolibbackend.service.BranchBookInventoryService;
import rs.beolib.beolibbackend.service.ReadingHistoryService;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final BranchBookInventoryService branchBookInventoryService;
    private final BookMetadataService bookMetadataService;
    private final ReadingHistoryService readingHistoryService;

    public BookController(
            BookService bookService,
            BranchBookInventoryService branchBookInventoryService,
            BookMetadataService bookMetadataService,
            ReadingHistoryService readingHistoryService
    ) {
        this.bookService = bookService;
        this.branchBookInventoryService = branchBookInventoryService;
        this.bookMetadataService = bookMetadataService;
        this.readingHistoryService = readingHistoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<BookDto>>> getPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        PagedResponse<BookDto> paged = bookService.findAllPaged(
                search,
                genre,
                available,
                branchId,
                page,
                size,
                sortBy,
                sortDirection
        );
        return ResponseEntity.ok(ApiResponse.ok("Books loaded", paged));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<BookDto>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Long branchId
    ) {
        List<BookDto> list = bookService.findAll(search, genre, available, branchId);
        return ResponseEntity.ok(ApiResponse.ok("Books loaded", list));
    }

    @GetMapping("/isbn/{isbn}/lookup")
    public ResponseEntity<ApiResponse<BookMetadataLookupDto>> lookupByIsbn(@PathVariable String isbn) {
        BookMetadataLookupDto metadata = bookMetadataService.lookupByIsbn(isbn);
        return ResponseEntity.ok(ApiResponse.ok("Book metadata loaded", metadata));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDto>> getById(@PathVariable Long id) {
        BookDto book = bookService.findById(id);
        return ResponseEntity.ok(ApiResponse.ok("Book loaded", book));
    }

    @GetMapping("/{id}/branches")
    public ResponseEntity<ApiResponse<BookBranchAvailabilityDto>> getBranchAvailability(@PathVariable Long id) {
        List<BookBranchAvailabilityDto> availability = branchBookInventoryService.findAvailabilityByBookId(id);
        return ResponseEntity.ok(ApiResponse.ok("Branch availability loaded", availability));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<BookReviewDto>> getReviews(@PathVariable Long id) {
        List<BookReviewDto> reviews = readingHistoryService.findReviewsByBookId(id);
        return ResponseEntity.ok(ApiResponse.ok("Book reviews loaded", reviews));
    }

    @PostMapping("/add-with-inventory")
    public ResponseEntity<ApiResponse<BookDto>> addWithInventory(
            @Valid @RequestBody BookCreateWithInventoryRequest request
    ) {
        BookDto created = bookService.createWithInventory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(201, "Book created with inventory", created));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<BookDto>> add(@Valid @RequestBody BookCreateRequest request) {
        BookDto created = bookService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Book created", created));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<BookDto>> update(@Valid @RequestBody BookUpdateRequest request) {
        BookDto updated = bookService.update(request);
        return ResponseEntity.ok(ApiResponse.ok("Book updated", updated));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        bookService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.of(200, "Book deleted", (Object) null));
    }
}
