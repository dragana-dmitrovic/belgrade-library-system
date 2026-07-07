package rs.beolib.beolibbackend.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import rs.beolib.beolibbackend.service.ReservationExpirationService;

@Component
public class ReservationExpirationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReservationExpirationScheduler.class);

    private final ReservationExpirationService reservationExpirationService;

    public ReservationExpirationScheduler(ReservationExpirationService reservationExpirationService) {
        this.reservationExpirationService = reservationExpirationService;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void expireOverdueReservationsDaily() {
        int expiredCount = reservationExpirationService.expireOverdueReservations();
        if (expiredCount > 0) {
            log.info("Expired {} overdue reservation(s)", expiredCount);
        }
    }
}
