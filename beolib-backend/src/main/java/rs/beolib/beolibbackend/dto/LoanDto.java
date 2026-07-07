package rs.beolib.beolibbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanDto {

    private Long id;
    private Long memberId;
    private String memberEmail;
    private String memberFullName;
    private Long bookCopyId;
    private String copyCode;
    private Long bookId;
    private String bookTitle;
    private Long branchId;
    private String branchName;
    private Long reservationId;
    private LocalDateTime loanDate;
    private LocalDate dueDate;
    private LocalDateTime returnedAt;
    private String status;
}
