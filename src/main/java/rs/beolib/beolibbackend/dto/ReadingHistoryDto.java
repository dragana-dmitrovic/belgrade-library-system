package rs.beolib.beolibbackend.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadingHistoryDto {

    private Long id;
    private UserDto user;
    private BookDto book;
    private LocalDate finishedAt;
    private int rating;
    private String review;
}
