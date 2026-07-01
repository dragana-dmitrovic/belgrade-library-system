package rs.beolib.beolibbackend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rs.beolib.beolibbackend.dto.ReadingHistoryCreateRequest;
import rs.beolib.beolibbackend.dto.ReadingHistoryDto;
import rs.beolib.beolibbackend.exception.ResourceNotFoundException;
import rs.beolib.beolibbackend.jparepo.BookRepository;
import rs.beolib.beolibbackend.jparepo.ReadingHistoryRepository;
import rs.beolib.beolibbackend.jparepo.UserRepository;
import rs.beolib.beolibbackend.mapper.ReadingHistoryMapper;
import rs.beolib.beolibbackend.model.Book;
import rs.beolib.beolibbackend.model.ReadingHistory;
import rs.beolib.beolibbackend.model.User;

@Service
@Transactional
public class ReadingHistoryService {

    private final ReadingHistoryRepository readingHistoryRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public ReadingHistoryService(
            ReadingHistoryRepository readingHistoryRepository,
            UserRepository userRepository,
            BookRepository bookRepository
    ) {
        this.readingHistoryRepository = readingHistoryRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public ReadingHistoryDto add(String userEmail, ReadingHistoryCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
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

    @Transactional(readOnly = true)
    public List<ReadingHistoryDto> findMine(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return readingHistoryRepository.findAllForUser(user.getId()).stream()
                .map(ReadingHistoryMapper::toDto)
                .toList();
    }
}
