package rs.beolib.beolibbackend.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class BookReviewDto {

    private Integer rating;
    private String comment;
    private LocalDate reviewDate;
    private String reviewerLabel;
}
