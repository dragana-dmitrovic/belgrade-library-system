package rs.beolib.beolibbackend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DirectLoanCreateRequest {

    private Long memberId;
    private String memberEmail;

    @NotNull
    private Long bookId;

    @NotNull
    private Long branchId;

    private String notes;
}
