package rs.beolib.beolibbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rs.beolib.beolibbackend.dto.ApiResponse;
import rs.beolib.beolibbackend.dto.ReadingHistoryCreateRequest;
import rs.beolib.beolibbackend.dto.ReadingHistoryDto;
import rs.beolib.beolibbackend.service.ReadingHistoryService;

@RestController
@RequestMapping("/api/history")
public class ReadingHistoryController {

    private final ReadingHistoryService readingHistoryService;

    public ReadingHistoryController(ReadingHistoryService readingHistoryService) {
        this.readingHistoryService = readingHistoryService;
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<ReadingHistoryDto>> add(
            Authentication authentication,
            @Valid @RequestBody ReadingHistoryCreateRequest request
    ) {
        ReadingHistoryDto created = readingHistoryService.add(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Reading history entry added", created));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<ReadingHistoryDto>> my(Authentication authentication) {
        List<ReadingHistoryDto> list = readingHistoryService.findMine(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Your reading history", list));
    }
}
