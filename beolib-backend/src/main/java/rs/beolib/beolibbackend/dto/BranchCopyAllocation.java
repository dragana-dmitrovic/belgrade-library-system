package rs.beolib.beolibbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BranchCopyAllocation {

    @NotNull
    private Long branchId;

    @NotNull
    @Min(0)
    private Integer copyCount;
}
