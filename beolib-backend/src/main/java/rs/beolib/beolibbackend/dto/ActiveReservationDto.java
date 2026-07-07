package rs.beolib.beolibbackend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveReservationDto {

    private Long reservationId;
    private Long memberId;
    private String memberEmail;
    private String memberFullName;
    private Long bookId;
    private String bookTitle;
    private Long branchId;
    private String branchName;
    private Long bookCopyId;
    private String copyCode;
    private LocalDateTime reservedAt;
    private LocalDateTime expiresAt;
    private String status;
}
