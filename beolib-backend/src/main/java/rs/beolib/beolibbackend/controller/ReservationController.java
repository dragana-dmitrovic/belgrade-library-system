package rs.beolib.beolibbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rs.beolib.beolibbackend.dto.ApiResponse;
import rs.beolib.beolibbackend.dto.ReservationCreateRequest;
import rs.beolib.beolibbackend.dto.ReservationDto;
import rs.beolib.beolibbackend.service.ReservationService;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ReservationDto>> create(
            Authentication authentication,
            @Valid @RequestBody ReservationCreateRequest request
    ) {
        ReservationDto created = reservationService.create(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Reservation created", created));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<ReservationDto>> my(Authentication authentication) {
        List<ReservationDto> list = reservationService.findMine(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Your reservations", list));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<ReservationDto>> all() {
        List<ReservationDto> list = reservationService.findAll();
        return ResponseEntity.ok(ApiResponse.ok("All reservations", list));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationDto>> cancelMine(
            Authentication authentication,
            @PathVariable Long id
    ) {
        ReservationDto updated = reservationService.cancelMine(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.ok("Reservation cancelled", updated));
    }
}
