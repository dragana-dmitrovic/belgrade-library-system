package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.ReservationDto;
import rs.beolib.beolibbackend.model.Reservation;

public final class ReservationMapper {

    private ReservationMapper() {
    }

    public static ReservationDto toDto(Reservation r) {
        if (r == null) {
            return null;
        }
        return new ReservationDto(
                r.getId(),
                UserMapper.toDto(r.getUser()),
                BookMapper.toDto(r.getBook()),
                BranchMapper.toDto(r.getBranch()),
                r.getReservedAt(),
                r.getDueDate(),
                r.getStatus().name(),
                r.getNotes()
        );
    }
}
