package rs.beolib.beolibbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationStatusUpdateRequest {

    @NotNull
    private Long reservationId;

    @NotBlank
    private String status;
}
