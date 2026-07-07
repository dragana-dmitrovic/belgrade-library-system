package rs.beolib.beolibbackend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.ActiveReservationDto;
import rs.beolib.beolibbackend.dto.DirectLoanCreateRequest;
import rs.beolib.beolibbackend.dto.LoanDto;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookCopyRepository;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.LibraryBranchRepository;
import rs.beolib.beolibbackend.jparepo.LoanRepository;
import rs.beolib.beolibbackend.jparepo.ReservationRepository;
import rs.beolib.beolibbackend.jparepo.UserRepository;
import rs.beolib.beolibbackend.mapper.LoanMapper;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.BookCopy;
import rs.beolib.beolibbackend.model.BookCopyStatus;
import rs.beolib.beolibbackend.model.LibraryBranch;
import rs.beolib.beolibbackend.model.Loan;
import rs.beolib.beolibbackend.model.LoanStatus;
import rs.beolib.beolibbackend.model.Reservation;
import rs.beolib.beolibbackend.model.ReservationStatus;
import rs.beolib.beolibbackend.model.Member;
import rs.beolib.beolibbackend.model.User;
import rs.beolib.beolibbackend.util.UserTypeResolver;

@Service
@Transactional
public class CirculationService {

    private static final int DEFAULT_LOAN_DAYS = 14;

    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final LibraryBranchRepository libraryBranchRepository;
    private final BranchBookInventoryService branchBookInventoryService;

    public CirculationService(
            LoanRepository loanRepository,
            ReservationRepository reservationRepository,
            BookCopyRepository bookCopyRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            LibraryBranchRepository libraryBranchRepository,
            BranchBookInventoryService branchBookInventoryService
    ) {
        this.loanRepository = loanRepository;
        this.reservationRepository = reservationRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.libraryBranchRepository = libraryBranchRepository;
        this.branchBookInventoryService = branchBookInventoryService;
    }

    public LoanDto issueFromReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active reservations can be issued");
        }
        if (loanRepository.existsByReservation_Id(reservationId)) {
            throw new IllegalArgumentException("A loan already exists for this reservation");
        }
        BookCopy bookCopy = reservation.getBookCopy();
        if (bookCopy == null) {
            throw new IllegalStateException("Reservation has no assigned book copy");
        }
        if (bookCopy.getStatus() != BookCopyStatus.RESERVED) {
            throw new IllegalStateException("Book copy is not reserved for this reservation");
        }

        bookCopy = bookCopyRepository.findByIdForUpdate(bookCopy.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book copy not found"));
        if (bookCopy.getStatus() != BookCopyStatus.RESERVED) {
            throw new IllegalStateException("Book copy is not reserved for this reservation");
        }

        LocalDate dueDate = LocalDate.now().plusDays(DEFAULT_LOAN_DAYS);

        Loan loan = new Loan();
        loan.setUser(reservation.getUser());
        loan.setBookCopy(bookCopy);
        loan.setReservation(reservation);
        loan.setLoanDate(LocalDateTime.now());
        loan.setDueDate(dueDate);
        loan.setStatus(LoanStatus.ACTIVE);

        bookCopy.setStatus(BookCopyStatus.LOANED);
        bookCopyRepository.save(bookCopy);

        reservation.setStatus(ReservationStatus.PICKED_UP);
        reservationRepository.save(reservation);

        Loan saved = loanRepository.save(loan);
        return LoanMapper.toDto(saved);
    }

    public LoanDto createDirectLoan(DirectLoanCreateRequest request) {
        Member member = UserTypeResolver.requireMember(resolveMember(request));
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        LibraryBranch branch = libraryBranchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        BookCopy bookCopy = bookCopyRepository.findFirstAvailableForUpdate(
                        book.getId(),
                        branch.getId(),
                        BookCopyStatus.AVAILABLE
                )
                .orElseThrow(() -> new IllegalArgumentException("No available copies at the selected branch"));

        LocalDate dueDate = LocalDate.now().plusDays(DEFAULT_LOAN_DAYS);

        bookCopy.setStatus(BookCopyStatus.LOANED);
        bookCopyRepository.save(bookCopy);

        Loan loan = new Loan();
        loan.setUser(member);
        loan.setBookCopy(bookCopy);
        loan.setReservation(null);
        loan.setLoanDate(LocalDateTime.now());
        loan.setDueDate(dueDate);
        loan.setStatus(LoanStatus.ACTIVE);

        Loan saved = loanRepository.saveAndFlush(loan);
        branchBookInventoryService.syncAfterBookCopyChange(book.getId(), branch.getId());
        return loanRepository.findByIdWithDetails(saved.getId())
                .map(LoanMapper::toDto)
                .orElseThrow(() -> new IllegalStateException("Loan saved but not found"));
    }

    public LoanDto returnLoan(Long loanId) {
        Loan loan = loanRepository.findByIdWithDetails(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active loans can be returned");
        }

        BookCopy bookCopy = loan.getBookCopy();
        if (bookCopy.getStatus() != BookCopyStatus.LOANED) {
            throw new IllegalStateException("Book copy is not on loan");
        }

        bookCopy = bookCopyRepository.findByIdForUpdate(bookCopy.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book copy not found"));
        if (bookCopy.getStatus() != BookCopyStatus.LOANED) {
            throw new IllegalStateException("Book copy is not on loan");
        }

        loan.setStatus(LoanStatus.RETURNED);
        loan.setReturnedAt(LocalDateTime.now());
        bookCopy.setStatus(BookCopyStatus.AVAILABLE);
        bookCopyRepository.save(bookCopy);

        Loan saved = loanRepository.save(loan);
        branchBookInventoryService.syncAfterBookCopyChange(
                bookCopy.getBook().getId(),
                bookCopy.getBranch().getId()
        );
        return LoanMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ActiveReservationDto> findActiveReservations() {
        return reservationRepository.findAllByStatusWithDetails(ReservationStatus.ACTIVE).stream()
                .map(LoanMapper::toActiveReservationDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoanDto> findLoans(String status, String memberEmail, String bookTitle, Long branchId, Boolean activeOnly) {
        LoanStatus loanStatus = null;
        if (Boolean.TRUE.equals(activeOnly)) {
            loanStatus = LoanStatus.ACTIVE;
        } else if (status != null && !status.isBlank()) {
            loanStatus = parseLoanStatus(status);
        }

        String normalizedEmail = memberEmail != null && !memberEmail.isBlank() ? memberEmail.trim() : null;
        String normalizedTitle = bookTitle != null && !bookTitle.isBlank() ? bookTitle.trim() : null;

        return loanRepository.findAllWithDetailsFiltered(
                        loanStatus,
                        normalizedEmail,
                        normalizedTitle,
                        branchId
                ).stream()
                .map(LoanMapper::toDto)
                .toList();
    }

    private User resolveMember(DirectLoanCreateRequest request) {
        if (request.getMemberId() != null) {
            return userRepository.findById(request.getMemberId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        }
        if (request.getMemberEmail() != null && !request.getMemberEmail().isBlank()) {
            return userRepository.findByEmail(request.getMemberEmail().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        }
        throw new IllegalArgumentException("Either memberId or memberEmail is required");
    }

    private LoanStatus parseLoanStatus(String raw) {
        try {
            return LoanStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown loan status: " + raw);
        }
    }
}
