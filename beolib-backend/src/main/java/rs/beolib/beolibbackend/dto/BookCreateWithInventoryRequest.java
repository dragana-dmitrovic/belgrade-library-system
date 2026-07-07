package rs.beolib.beolibbackend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data
public class BookCreateWithInventoryRequest {

    @NotBlank
    @Size(max = 32)
    private String isbn;
    @NotBlank
    @Size(max = 255)
    private String title;
    @NotBlank
    @Size(max = 255)
    private String authorName;
    @NotBlank
    private String genre;
    private String description;
    @Size(max = 1024)
    private String coverImageUrl;
    @NotEmpty
    @Valid
    private List<BranchCopyAllocation> branchAllocations;
    @AssertTrue(message = "At least one branch must have copyCount greater than 0")
    public boolean isAtLeastOneCopyAllocated() {
        if (branchAllocations == null || branchAllocations.isEmpty()) {
            return false;
        }
        return branchAllocations.stream()
                .anyMatch(allocation -> allocation.getCopyCount() != null && allocation.getCopyCount() > 0);
    }
}
