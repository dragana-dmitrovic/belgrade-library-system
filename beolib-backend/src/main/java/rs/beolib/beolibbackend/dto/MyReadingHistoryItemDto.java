package rs.beolib.beolibbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import rs.beolib.beolibbackend.model.BookGenre;

@Data
public class MyReadingHistoryItemDto {

    private Long loanId;
    private Long bookId;
    private String title;
    private String author;
    private BookGenre genre;
    private String coverImageUrl;
    private LocalDateTime returnedAt;
    private LocalDate dueDate;
    private Long reviewId;
    private Integer rating;
    private String comment;
    private LocalDate reviewDate;
    private boolean canReview;
    private boolean hasReview;
}
