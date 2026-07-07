package rs.beolib.beolibbackend.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.ReservationCreateRequest;
import rs.beolib.beolibbackend.dto.ReservationDto;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookCopyRepository;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.LibraryBranchRepository;
import rs.beolib.beolibbackend.jparepo.ReservationRepository;
import rs.beolib.beolibbackend.jparepo.UserRepository;
import rs.beolib.beolibbackend.mapper.ReservationMapper;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.BookCopy;
import rs.beolib.beolibbackend.model.BookCopyStatus;
import rs.beolib.beolibbackend.model.LibraryBranch;
import rs.beolib.beolibbackend.model.Reservation;
import rs.beolib.beolibbackend.model.ReservationStatus;
import rs.beolib.beolibbackend.model.User;
import rs.beolib.beolibbackend.util.UserTypeResolver;

@Service
@Transactional
public class ReservationService {

    private static final int RESERVATION_EXPIRY_DAYS = 2;

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final LibraryBranchRepository libraryBranchRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BranchBookInventoryService branchBookInventoryService;

    public ReservationService(
            ReservationRepository reservationRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            LibraryBranchRepository libraryBranchRepository,
            BookCopyRepository bookCopyRepository,
            BranchBookInventoryService branchBookInventoryService
    ) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.libraryBranchRepository = libraryBranchRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.branchBookInventoryService = branchBookInventoryService;
    }

    public ReservationDto create(String userEmail, ReservationCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserTypeResolver.requireMember(user);
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        LibraryBranch branch = libraryBranchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        if (reservationRepository.existsByUser_IdAndBook_IdAndStatusIn(
                user.getId(),
                book.getId(),
                List.of(ReservationStatus.ACTIVE)
        )) {
            throw new IllegalArgumentException("You already have an active reservation for this book");
        }

        BookCopy bookCopy = bookCopyRepository.findFirstAvailableForUpdate(
                        book.getId(),
                        branch.getId(),
                        BookCopyStatus.AVAILABLE
                )
                .orElseThrow(() -> new IllegalArgumentException("No available copies at the selected branch"));

        bookCopy.setStatus(BookCopyStatus.RESERVED);
        bookCopyRepository.save(bookCopy);

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setBranch(branch);
        reservation.setBookCopy(bookCopy);
        reservation.setNotes(request.getNotes());
        reservation.setStatus(ReservationStatus.ACTIVE);
        reservation.setExpiresAt(LocalDateTime.now().plusDays(RESERVATION_EXPIRY_DAYS));

        Reservation saved = reservationRepository.save(reservation);
        branchBookInventoryService.syncAfterBookCopyChange(book.getId(), branch.getId());
        return ReservationMapper.toDto(saved);
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

    public ReservationDto cancelMine(String userEmail, Long reservationId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only cancel your own reservations");
        }
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active reservations can be cancelled");
        }

        BookCopy bookCopy = reservation.getBookCopy();
        if (bookCopy == null) {
            throw new IllegalStateException("Reservation has no assigned book copy");
        }

        bookCopy = bookCopyRepository.findByIdForUpdate(bookCopy.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book copy not found"));
        if (bookCopy.getStatus() != BookCopyStatus.RESERVED) {
            throw new IllegalStateException("Book copy is not reserved for this reservation");
        }

        bookCopy.setStatus(BookCopyStatus.AVAILABLE);
        bookCopyRepository.save(bookCopy);
        reservation.setStatus(ReservationStatus.CANCELLED);

        Reservation saved = reservationRepository.save(reservation);
        branchBookInventoryService.syncAfterBookCopyChange(
                reservation.getBook().getId(),
                reservation.getBranch().getId()
        );
        return ReservationMapper.toDto(saved);
    }
}
