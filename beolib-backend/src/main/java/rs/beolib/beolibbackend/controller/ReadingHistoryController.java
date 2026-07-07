package rs.beolib.beolibbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import rs.beolib.beolibbackend.dto.ApiResponse;
import rs.beolib.beolibbackend.dto.MyReadingHistoryItemDto;
import rs.beolib.beolibbackend.dto.ReadingHistoryCreateRequest;
import rs.beolib.beolibbackend.dto.ReadingHistoryDto;
import rs.beolib.beolibbackend.dto.ReadingHistoryReviewRequest;
import rs.beolib.beolibbackend.service.ReadingHistoryService;

@RestController
public class ReadingHistoryController {

    private final ReadingHistoryService readingHistoryService;

    public ReadingHistoryController(ReadingHistoryService readingHistoryService) {
        this.readingHistoryService = readingHistoryService;
    }

    @PostMapping("/api/reading-history")
    public ResponseEntity<ApiResponse<MyReadingHistoryItemDto>> createReview(
            Authentication authentication,
            @Valid @RequestBody ReadingHistoryReviewRequest request
    ) {
        MyReadingHistoryItemDto created = readingHistoryService.createReview(
                authentication.getName(),
                request
        );
        return ResponseEntity.ok(ApiResponse.ok("Review saved", created));
    }

    @PostMapping("/api/history/add")
    public ResponseEntity<ApiResponse<ReadingHistoryDto>> addLegacy(
            Authentication authentication,
            @Valid @RequestBody ReadingHistoryCreateRequest request
    ) {
        ReadingHistoryDto created = readingHistoryService.add(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Reading history entry added", created));
    }

    @GetMapping({"/api/reading-history/my", "/api/history/my"})
    public ResponseEntity<ApiResponse<MyReadingHistoryItemDto>> my(Authentication authentication) {
        List<MyReadingHistoryItemDto> list = readingHistoryService.findMyItems(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Your reading history", list));
    }
}
