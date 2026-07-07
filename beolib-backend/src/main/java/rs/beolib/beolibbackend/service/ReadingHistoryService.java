package rs.beolib.beolibbackend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.BookReviewDto;
import rs.beolib.beolibbackend.dto.MyReadingHistoryItemDto;
import rs.beolib.beolibbackend.dto.ReadingHistoryCreateRequest;
import rs.beolib.beolibbackend.dto.ReadingHistoryDto;
import rs.beolib.beolibbackend.dto.ReadingHistoryReviewRequest;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.LoanRepository;
import rs.beolib.beolibbackend.jparepo.ReadingHistoryRepository;
import rs.beolib.beolibbackend.jparepo.UserRepository;
import rs.beolib.beolibbackend.mapper.ReadingHistoryMapper;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.Loan;
import rs.beolib.beolibbackend.model.LoanStatus;
import rs.beolib.beolibbackend.model.ReadingHistory;
import rs.beolib.beolibbackend.model.User;
import rs.beolib.beolibbackend.util.UserTypeResolver;

@Service
@Transactional
public class ReadingHistoryService {

    private static final String ANONYMOUS_REVIEWER_LABEL = "Član biblioteke";

    private final ReadingHistoryRepository readingHistoryRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;

    public ReadingHistoryService(
            ReadingHistoryRepository readingHistoryRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            LoanRepository loanRepository
    ) {
        this.readingHistoryRepository = readingHistoryRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.loanRepository = loanRepository;
    }

    public ReadingHistoryDto add(String userEmail, ReadingHistoryCreateRequest request) {
        User user = requireMember(userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        validateReturnedLoan(user, request.getBookId());
        if (readingHistoryRepository.existsByUser_IdAndBook_Id(user.getId(), request.getBookId())) {
            throw new IllegalArgumentException("You have already reviewed this book");
        }
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        ReadingHistory history = new ReadingHistory();
        history.setUser(user);
        history.setBook(book);
        history.setFinishedAt(request.getFinishedAt());
        history.setRating(request.getRating());
        history.setReview(request.getReview());
        return ReadingHistoryMapper.toDto(readingHistoryRepository.save(history));
    }

    public MyReadingHistoryItemDto createReview(String userEmail, ReadingHistoryReviewRequest request) {
        User user = requireMember(userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        validateReturnedLoan(user, request.getBookId());
        if (readingHistoryRepository.existsByUser_IdAndBook_Id(user.getId(), request.getBookId())) {
            throw new IllegalArgumentException("You have already reviewed this book");
        }
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        ReadingHistory history = new ReadingHistory();
        history.setUser(user);
        history.setBook(book);
        history.setFinishedAt(LocalDate.now());
        history.setRating(request.getRating());
        history.setReview(request.getComment());
        ReadingHistory saved = readingHistoryRepository.save(history);

        Loan latestLoan = findLatestReturnedLoan(user.getId(), book.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "You can only review a book after returning a loan for it"
                ));
        return toItemDto(latestLoan, saved);
    }

    @Transactional(readOnly = true)
    public List<ReadingHistoryDto> findMine(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return readingHistoryRepository.findAllForUser(user.getId()).stream()
                .map(ReadingHistoryMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookReviewDto> findReviewsByBookId(Long bookId) {
        bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        return readingHistoryRepository.findAllByBook_IdOrderByFinishedAtDesc(bookId).stream()
                .filter(this::hasReviewContent)
                .map(this::toBookReviewDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MyReadingHistoryItemDto> findMyItems(String userEmail) {
        User user = requireMember(userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));

        List<Loan> returnedLoans = loanRepository.findByUser_IdAndStatusWithBook(
                user.getId(),
                LoanStatus.RETURNED
        );
        Map<Long, Loan> latestLoanByBookId = new LinkedHashMap<>();
        for (Loan loan : returnedLoans) {
            Long bookId = loan.getBookCopy().getBook().getId();
            latestLoanByBookId.putIfAbsent(bookId, loan);
        }

        Map<Long, ReadingHistory> reviewByBookId = new LinkedHashMap<>();
        for (ReadingHistory history : readingHistoryRepository.findAllForUser(user.getId())) {
            reviewByBookId.putIfAbsent(history.getBook().getId(), history);
        }

        List<MyReadingHistoryItemDto> items = new ArrayList<>();
        for (Map.Entry<Long, Loan> entry : latestLoanByBookId.entrySet()) {
            ReadingHistory review = reviewByBookId.get(entry.getKey());
            items.add(toItemDto(entry.getValue(), review));
        }

        items.sort(Comparator
                .comparing((MyReadingHistoryItemDto item) -> item.isHasReview() ? 1 : 0)
                .thenComparing(
                        MyReadingHistoryItemDto::getReturnedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ));

        return items;
    }

    private boolean hasReviewContent(ReadingHistory history) {
        boolean hasRating = history.getRating() > 0;
        String reviewText = history.getReview();
        boolean hasComment = reviewText != null && !reviewText.isBlank();
        return hasRating || hasComment;
    }

    private BookReviewDto toBookReviewDto(ReadingHistory history) {
        BookReviewDto dto = new BookReviewDto();
        dto.setRating(history.getRating() > 0 ? history.getRating() : null);
        dto.setComment(history.getReview());
        dto.setReviewDate(history.getFinishedAt());
        dto.setReviewerLabel(ANONYMOUS_REVIEWER_LABEL);
        return dto;
    }

    private User requireMember(User user) {
        return UserTypeResolver.requireMember(user);
    }

    private void validateReturnedLoan(User user, Long bookId) {
        if (!loanRepository.existsByUser_IdAndBookCopy_Book_IdAndStatus(
                user.getId(),
                bookId,
                LoanStatus.RETURNED
        )) {
            throw new IllegalArgumentException(
                    "You can only review a book after returning a loan for it"
            );
        }
    }

    private java.util.Optional<Loan> findLatestReturnedLoan(Long userId, Long bookId) {
        return loanRepository.findByUser_IdAndStatusWithBook(userId, LoanStatus.RETURNED).stream()
                .filter(loan -> loan.getBookCopy().getBook().getId().equals(bookId))
                .findFirst();
    }

    private MyReadingHistoryItemDto toItemDto(Loan loan, ReadingHistory review) {
        Book book = loan.getBookCopy().getBook();
        MyReadingHistoryItemDto dto = new MyReadingHistoryItemDto();
        dto.setLoanId(loan.getId());
        dto.setBookId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor() != null ? book.getAuthor().getName() : null);
        dto.setGenre(book.getGenre());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        dto.setReturnedAt(loan.getReturnedAt());
        dto.setDueDate(loan.getDueDate());
        if (review != null) {
            dto.setReviewId(review.getId());
            dto.setRating(review.getRating());
            dto.setComment(review.getReview());
            dto.setReviewDate(review.getFinishedAt());
            dto.setHasReview(true);
            dto.setCanReview(false);
        } else {
            dto.setHasReview(false);
            dto.setCanReview(true);
        }
        return dto;
    }
}
