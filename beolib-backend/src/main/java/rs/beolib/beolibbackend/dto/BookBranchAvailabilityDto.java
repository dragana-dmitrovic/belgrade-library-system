package rs.beolib.beolibbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookBranchAvailabilityDto {

    private Long branchId;
    private String branchName;
    private int totalCopies;
    private int availableCopies;
}
