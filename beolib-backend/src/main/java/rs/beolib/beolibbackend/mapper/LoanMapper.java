package rs.beolib.beolibbackend.mapper;

import rs.beolib.beolibbackend.dto.ActiveReservationDto;
import rs.beolib.beolibbackend.dto.LoanDto;
import rs.beolib.beolibbackend.model.BookCopy;
import rs.beolib.beolibbackend.model.Loan;
import rs.beolib.beolibbackend.model.Reservation;
import rs.beolib.beolibbackend.mapper.UserMapper;
import rs.beolib.beolibbackend.model.User;

public final class LoanMapper {

    private LoanMapper() {
    }

    public static LoanDto toDto(Loan loan) {
        if (loan == null) {
            return null;
        }
        User member = loan.getUser();
        BookCopy bookCopy = loan.getBookCopy();
        return new LoanDto(
                loan.getId(),
                member.getId(),
                member.getEmail(),
                memberFullName(member),
                bookCopy.getId(),
                bookCopy.getCopyCode(),
                bookCopy.getBook().getId(),
                bookCopy.getBook().getTitle(),
                bookCopy.getBranch().getId(),
                bookCopy.getBranch().getName(),
                loan.getReservation() != null ? loan.getReservation().getId() : null,
                loan.getLoanDate(),
                loan.getDueDate(),
                loan.getReturnedAt(),
                loan.getStatus().name()
        );
    }

    public static ActiveReservationDto toActiveReservationDto(Reservation reservation) {
        if (reservation == null) {
            return null;
        }
        User member = reservation.getUser();
        BookCopy bookCopy = reservation.getBookCopy();
        return new ActiveReservationDto(
                reservation.getId(),
                member.getId(),
                member.getEmail(),
                memberFullName(member),
                reservation.getBook().getId(),
                reservation.getBook().getTitle(),
                reservation.getBranch().getId(),
                reservation.getBranch().getName(),
                bookCopy != null ? bookCopy.getId() : null,
                bookCopy != null ? bookCopy.getCopyCode() : null,
                reservation.getReservedAt(),
                reservation.getExpiresAt(),
                reservation.getStatus().name()
        );
    }

    private static String memberFullName(User user) {
        return UserMapper.extractFullName(user);
    }
}
