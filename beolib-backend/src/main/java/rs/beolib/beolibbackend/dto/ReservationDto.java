package rs.beolib.beolibbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {

    private Long id;
    private UserDto user;
    private BookDto book;
    private BranchDto branch;
    private LocalDateTime reservedAt;
    private LocalDate dueDate;
    private String status;
    private String notes;
}
