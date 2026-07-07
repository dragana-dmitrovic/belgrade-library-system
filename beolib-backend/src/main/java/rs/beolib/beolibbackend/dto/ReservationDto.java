package rs.beolib.beolibbackend.dto;

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
    private Long bookCopyId;
    private LocalDateTime reservedAt;
    private LocalDateTime expiresAt;
    private String status;
    private String notes;
}
