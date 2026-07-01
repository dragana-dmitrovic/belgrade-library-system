package rs.beolib.beolibbackend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.ReservationCreateRequest;
import rs.beolib.beolibbackend.dto.ReservationDto;
import rs.beolib.beolibbackend.dto.ReservationStatusUpdateRequest;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.LibraryBranchRepository;
import rs.beolib.beolibbackend.jparepo.ReservationRepository;
import rs.beolib.beolibbackend.jparepo.UserRepository;
import rs.beolib.beolibbackend.mapper.ReservationMapper;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.LibraryBranch;
import rs.beolib.beolibbackend.model.Reservation;
import rs.beolib.beolibbackend.model.ReservationStatus;
import rs.beolib.beolibbackend.model.User;

@Service
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final LibraryBranchRepository libraryBranchRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            LibraryBranchRepository libraryBranchRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.libraryBranchRepository = libraryBranchRepository;
    }

    public ReservationDto create(String userEmail, ReservationCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        LibraryBranch branch = libraryBranchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        if (reservationRepository.existsByUser_IdAndBook_IdAndStatusIn(
                user.getId(),
                book.getId(),
                List.of(ReservationStatus.PENDING, ReservationStatus.APPROVED)
        )) {
            throw new IllegalArgumentException("You already have an active reservation for this book");
        }
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalArgumentException("No copies available for this book");
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setBranch(branch);
        reservation.setDueDate(request.getDueDate());
        reservation.setNotes(request.getNotes());
        reservation.setStatus(ReservationStatus.PENDING);
        return ReservationMapper.toDto(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> findMine(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reservationRepository.findAllForUser(user.getId()).stream()
                .map(ReservationMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> findAll() {
        return reservationRepository.findAllWithDetails().stream()
                .map(ReservationMapper::toDto)
                .toList();
    }

    public ReservationDto updateStatus(ReservationStatusUpdateRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        ReservationStatus oldStatus = reservation.getStatus();
        ReservationStatus newStatus = parseStatus(request.getStatus());
        applyInventoryTransition(reservation.getBook(), oldStatus, newStatus);
        reservation.setStatus(newStatus);
        return ReservationMapper.toDto(reservationRepository.save(reservation));
    }

    public ReservationDto cancelMine(String userEmail, Long reservationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only cancel your own reservations");
        }
        ReservationStatus oldStatus = reservation.getStatus();
        if (oldStatus == ReservationStatus.CANCELLED || oldStatus == ReservationStatus.RETURNED) {
            throw new IllegalArgumentException("Reservation is already closed");
        }
        applyInventoryTransition(reservation.getBook(), oldStatus, ReservationStatus.CANCELLED);
        reservation.setStatus(ReservationStatus.CANCELLED);
        return ReservationMapper.toDto(reservationRepository.save(reservation));
    }

    private ReservationStatus parseStatus(String raw) {
        try {
            return ReservationStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown reservation status: " + raw);
        }
    }

    private void applyInventoryTransition(Book book, ReservationStatus oldStatus, ReservationStatus newStatus) {
        if (oldStatus == newStatus) {
            return;
        }
        boolean oldClosed = oldStatus == ReservationStatus.CANCELLED || oldStatus == ReservationStatus.RETURNED;
        boolean newClosed = newStatus == ReservationStatus.CANCELLED || newStatus == ReservationStatus.RETURNED;

        if (!oldClosed && newClosed) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            return;
        }
        if (oldClosed && !newClosed) {
            throw new IllegalArgumentException("Cannot reopen a cancelled/returned reservation");
        }
    }
}
