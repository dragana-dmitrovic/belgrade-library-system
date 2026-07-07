package rs.beolib.beolibbackend.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.jparepo.BookCopyRepository;
import rs.beolib.beolibbackend.jparepo.ReservationRepository;
import rs.beolib.beolibbackend.model.BookCopy;
import rs.beolib.beolibbackend.model.BookCopyStatus;
import rs.beolib.beolibbackend.model.Reservation;
import rs.beolib.beolibbackend.model.ReservationStatus;

@Service
@Transactional
public class ReservationExpirationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationExpirationService.class);

    private final ReservationRepository reservationRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BranchBookInventoryService branchBookInventoryService;

    public ReservationExpirationService(
            ReservationRepository reservationRepository,
            BookCopyRepository bookCopyRepository,
            BranchBookInventoryService branchBookInventoryService
    ) {
        this.reservationRepository = reservationRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.branchBookInventoryService = branchBookInventoryService;
    }

    public int expireOverdueReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> overdue = reservationRepository.findOverdueActive(ReservationStatus.ACTIVE, now);
        Set<String> syncedInventoryKeys = new HashSet<>();
        int expiredCount = 0;

        for (Reservation reservation : overdue) {
            BookCopy bookCopy = reservation.getBookCopy();
            if (bookCopy == null) {
                log.warn(
                        "Skipping expiration for reservation {} — no book copy assigned",
                        reservation.getId()
                );
                continue;
            }

            bookCopy = bookCopyRepository.findByIdForUpdate(bookCopy.getId()).orElse(null);
            if (bookCopy == null) {
                log.warn(
                        "Skipping expiration for reservation {} — book copy {} not found",
                        reservation.getId(),
                        reservation.getBookCopy().getId()
                );
                continue;
            }

            if (bookCopy.getStatus() == BookCopyStatus.RESERVED) {
                bookCopy.setStatus(BookCopyStatus.AVAILABLE);
                bookCopyRepository.save(bookCopy);
            }

            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);
            expiredCount++;

            String syncKey = reservation.getBook().getId() + ":" + reservation.getBranch().getId();
            syncedInventoryKeys.add(syncKey);
        }

        for (String key : syncedInventoryKeys) {
            String[] parts = key.split(":");
            Long bookId = Long.parseLong(parts[0]);
            Long branchId = Long.parseLong(parts[1]);
            branchBookInventoryService.syncAfterBookCopyChange(bookId, branchId);
        }

        return expiredCount;
    }
}
