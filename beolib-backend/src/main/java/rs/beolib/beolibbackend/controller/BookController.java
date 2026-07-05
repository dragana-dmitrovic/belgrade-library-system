package rs.beolib.beolibbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
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
import rs.beolib.beolibbackend.dto.BookCreateRequest;
import rs.beolib.beolibbackend.dto.BookDto;
import rs.beolib.beolibbackend.dto.BookUpdateRequest;
import rs.beolib.beolibbackend.service.BookService;
import rs.beolib.beolibbackend.service.BranchBookInventoryService;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final BranchBookInventoryService branchBookInventoryService;

    public BookController(BookService bookService, BranchBookInventoryService branchBookInventoryService) {
        this.bookService = bookService;
        this.branchBookInventoryService = branchBookInventoryService;
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<BookDto>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Boolean available
    ) {
        List<BookDto> list = bookService.findAll(search, genre, available);
        return ResponseEntity.ok(ApiResponse.ok("Books loaded", list));
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
