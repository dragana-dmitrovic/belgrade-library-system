package rs.beolib.beolibbackend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationCreateRequest {

    @NotNull
    private Long bookId;

    @NotNull
    private Long branchId;

    private String notes;
}
