package rs.beolib.beolibbackend.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rs.beolib.beolibbackend.dto.ActiveReservationDto;
import rs.beolib.beolibbackend.dto.ApiResponse;
import rs.beolib.beolibbackend.dto.DirectLoanCreateRequest;
import rs.beolib.beolibbackend.dto.ExpireOverdueResponse;
import rs.beolib.beolibbackend.dto.LoanDto;
import rs.beolib.beolibbackend.service.CirculationService;
import rs.beolib.beolibbackend.service.ReservationExpirationService;

@RestController
@RequestMapping("/api/circulation")
public class CirculationController {

    private final CirculationService circulationService;
    private final ReservationExpirationService reservationExpirationService;

    public CirculationController(
            CirculationService circulationService,
            ReservationExpirationService reservationExpirationService
    ) {
        this.circulationService = circulationService;
        this.reservationExpirationService = reservationExpirationService;
    }

    @PostMapping("/reservations/expire-overdue")
    public ResponseEntity<ApiResponse<ExpireOverdueResponse>> expireOverdueReservations() {
        int expiredCount = reservationExpirationService.expireOverdueReservations();
        ExpireOverdueResponse response = new ExpireOverdueResponse(
                expiredCount,
                "Expired reservations processed successfully"
        );
        return ResponseEntity.ok(ApiResponse.ok("Expired reservations processed", response));
    }

    @PostMapping("/reservations/{reservationId}/issue")
    public ResponseEntity<ApiResponse<LoanDto>> issueFromReservation(@PathVariable Long reservationId) {
        LoanDto loan = circulationService.issueFromReservation(reservationId);
        return ResponseEntity.ok(ApiResponse.ok("Loan issued from reservation", loan));
    }

    @PostMapping("/loans")
    public ResponseEntity<ApiResponse<LoanDto>> createDirectLoan(
            @Valid @RequestBody DirectLoanCreateRequest request
    ) {
        LoanDto loan = circulationService.createDirectLoan(request);
        return ResponseEntity.ok(ApiResponse.ok("Direct loan created", loan));
    }

    @PostMapping("/loans/{loanId}/return")
    public ResponseEntity<ApiResponse<LoanDto>> returnLoan(@PathVariable Long loanId) {
        LoanDto loan = circulationService.returnLoan(loanId);
        return ResponseEntity.ok(ApiResponse.ok("Loan returned", loan));
    }

    @GetMapping("/reservations/active")
    public ResponseEntity<ApiResponse<ActiveReservationDto>> activeReservations() {
        List<ActiveReservationDto> list = circulationService.findActiveReservations();
        return ResponseEntity.ok(ApiResponse.ok("Active reservations", list));
    }

    @GetMapping("/loans")
    public ResponseEntity<ApiResponse<LoanDto>> loans(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String memberEmail,
            @RequestParam(required = false) String bookTitle,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        List<LoanDto> list = circulationService.findLoans(status, memberEmail, bookTitle, branchId, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok("Loans", list));
    }
}
