package rs.beolib.beolibbackend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class ReservationCreateRequest {

    @NotNull
    private Long bookId;

    @NotNull
    private Long branchId;

    @NotNull
    private LocalDate dueDate;

    private String notes;
}
