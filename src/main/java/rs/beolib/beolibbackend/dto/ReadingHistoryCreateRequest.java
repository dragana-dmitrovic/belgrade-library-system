package rs.beolib.beolibbackend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;

@Data
public class ReadingHistoryCreateRequest {

    @NotNull
    private Long bookId;

    @NotNull
    private LocalDate finishedAt;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 1000)
    private String review;
}
